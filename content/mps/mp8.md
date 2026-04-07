---
title: MP8 
subtitle: aiohttp lite
author: Luther Tychonievich
---

In this Meandering Paradox (MP) you'll implement key components of the web framework we'll use for several future MPs.
Some of the design decisions might seem a little odd at first, but make sense in the larger context of aiohttp, the library we'll use for building web services.

A major part of this MP is parsing and creating HTTP messages.
HTTP messages are defined in the following standards:

- [RFC 2616](https://www.rfc-editor.org/rfc/rfc2616) defining HTTP 1.1, which you'll need to both parse and generate.
    - [mdn web docs](https://developer.mozilla.org/en-US/docs/Web/HTTP) has an easier-to-read summary.
    - [Wikipedia](https://en.wikipedia.org/wiki/HTTP) has another summary.

# Initial Files

[`mp8.zip`](../mp8.zip) contains a simple web server to use in testing once your code is fully complete, consisting of `demoserver.py` and the `microbe/` and `chat/` folders.
It also contains a starter file, `web.py`, which you will modify and automated tests in `test_webserver.py`.

# MP Structure

This MP has more imposed structure than some others because of the desire to have it mimic how aiohttp is organized.

You will implement

- `class Response` which provides a tidy way to express HTTP responses.
    The constuctor is the only thing you have to implement as defined;
    we recommend also creating a to-bytes conversion method, but if you have another way to do that that's OK too.

- `class Request` which provides a parsed-out ready-to-use HTTP request.
    We provide several method signatures you need to implement.

- `class Application` which
    a. parses the bytes of a TCP message into the HTTP requests;
    b. decides which API endpoint to send the request to; and
    c. sends the response from the endpoint over the TCP connection.

We have implemented for you

- `def run_app`which roughly calls `asyncio.start_server(app.serve)`, with several wrapper functions to help make error messages show up cleanly. In particular, those wrappers are:
    - `app.serve` is in a `try` block, where all errors are caught and both (a) printed to the terminal and (b) shown as an HTTP response with status code 500.
    - `srv.serve_forever` is in a `try` block that catches `CancelledError`s so that if any of the coroutines is cancelled, so is the entire program.
    - `asyncio.run` is in a `try` block that catches `KeyboardInterrupt`s so that Ctrl+C stops the server without creating an error message.

- `def json_response` which is a simple wrapper around the `Response` constructor.

- `reason_phases` which is copied from the HTTP specification to simplify creating responses.

- `class RouteTableDef` which implements decorators to simplify server construction.

We also provide an example server you can us to test in the browser
and a set of automated tests.


# class Response

A Response needs to be creatable and convertible to bytes.

The constructor has only optional keyword arguments:

- `status: int = 200`

    The 3-digit status code to use in the response's start line.
    We will only provide status codes that are keys in `reason_phrases`; how you handle status that are not in that `dict` is up to you.

- `text: str|None = None`

    One of two ways to provide the body of the message.
    If present, this should be encoded as UTF-8.
    
    If `text` is supplied (not `None`), then `body` will not be supplied (will be `None`).
    
    If `text` is supplied, set the `Content-Length` header to be the number of bytes in the UTF-8-encoded text.

- `body: bytes|None = None`

    One of two ways to provide the body of the message.

    If `body` is supplied (not `None`), then `text` will not be supplied (will be `None`).

    If `body` is supplied, set the `Content-Length` header to be the number of bytes in body.
    
    If neither `text` not `body` is supplied, treat this the same as if `body` was `b''`

- `headers: dict[str,str]|None = None`

    Additional HTTP headers to add to the HTTP message.

- `content_type: str|None = None`

    The `Content-Type` header.
    
    If this is `None` and `text` was supplied, use the content type `text/plain; charset=utf-8`.
    
    If this is `None` and `body` was supplied, use the content type `application/octet-stream`.
    
    If neither `text` nor `body` is supplied, do not include a `Content-Type` header in the response.
    

We also suggest making a function named `self __bytes__(self) -> byte` that produces the encoded bytes of an HTTP message representing the request object.

### Note

Going between `bytes` and `str`

To decode bytes into a string, use `bytesobject.decode('utf-8')`;
to encode them again, use `stringobject.encode('utf-8')`.
Any other character set can be used instead of `'utf-8'` if you have a reason to do so.


### Aside: Methods with double-underscores in Python

Python allows classes to overload many different aspects of the language.
Classes do this by defining specific methods, all of which use two underscores at the beginning and end of the name.
For example,

- `__init__` is the constructor; use as `myclassname(...)`
- `__bytes__` is a type converter; use as `bytes(myobject)`. `__str__` is similar, but for strings instead of bytes.
- `__mul__` is an operator overload; use as `myobject * ...`

There are *many* more such methods; see the [special method names](https://docs.python.org/pl/3.13/reference/datamodel.html#special-method-names) section of the Python documentation for more.


# class Request

Requests are created by your code (particularly in `Application.serve`), and can have any constructor you wish.
The objects are passed into functions that implement web services, so they have several member methods and properties that you need to implement.
These methods return various values extracted from an HTTP request.

### asside Methods vs Properties

If a member method is preceded by `@property`,
it is invoked *without parentheses*.

For the most part you can just assume that `@property` works.
If you are curious, under the hood it works by changing what the `.` operator does;
you can read more about it in the [official documentation of the property class](https://docs.python.org/3/library/functions.html#property).

The docstrings of the methods and properties explain what each one should return.
These often use terminology found in the HTTP specification.

# class Application

The application class has two important methods.
You might find it helpful to add other methods and a constructor as well.

- `def add_routes(self, routes: RouteTableDef) -> None`

    We wrote `RouteTableDef` for you; the important thing in it is the `routes` member variable,
    which has all the function callbacks that the web app implementer defined.
    Storing that dict in the Application may be sufficient for this method.
    
- `async def serve(self, reader:asyncio.StreamReader, writer:asyncio.StreamWriter) -> None`.

    This method does many things.

    1. Read all the bytes in the [`reader`](https://docs.python.org/3/library/asyncio-stream.html#streamreader)^[You probably need to do two different checks for "no more":<br/>  `while not reader.at_eof():` will check if the reader knows it's at the end.<br/>  the various reading methods return some kind of special value (usually empty) if they run into the end of the input.], and in the loop do the following:

        - Split the bytes into HTTP messages (in general the reader may have many HTTP messages).
        - For each HTTP message, parse out its parts and create a `Request` object.
        - Use the method and path of the HTTP request to make a `Response` object as follows:
            - If the (method, path) pair has a function from `add_routes`, call that function to get a Response
            - Otherwise, use `Response(status=404)`
        - Send the bytes of the response to the [`writer`](https://docs.python.org/3/library/asyncio-stream.html#streamwriter)

        If you try to read a message and get 0 bytes, `break`.

    2. Once the reader is out of bytes, `await writer.drain()` to ensure that all bytes make it over the TCP connection, and then `writer.close()`

# Testing your code

## Development testing

You probably want to write your own small programs to test your code during development.
For example,

- For `Response`, try creating a Response object and then looking at its bytes, comparing it to what you expect from the HTTP specification.

- For `Request`, try passing in specific HTTP messages from the HTTP specification or other examples and checking if they are parsed correctly.

- For `Application`, try passing in custom HTTP requests using a simple server and `curl`

    A simple server might look as simple as
    
    ```py
    import web
    routes = web.RouteTableDef()

    @routes.get("/some/path")
    async def root(request: web.Request) -> web.Response:
        return web.Response(text='This is a test)

    if __name__ == '__main__':
        app = web.Application()
        app.add_routes(routes)
        web.run_app(app) # this function never returns
    ```
    
    You could then run that server and send it HTTP requests using
    
    ```sh
    curl -v http://127.0.0.1:5000/some/path
    ```
    
    This would send the following request
    
    ```py
    b'GET /some/path HTTP/1.1\r\nHost: 127.0.0.1:5000\r\nUser-Agent: curl/8.9.1\r\nAccept: */*\r\n\r\n'
    ```
    
    You can change to the POST method with `--request POST` on the curl command line
    
    You can add a message body to the request with `--data "message body"` on the curl command line
    


## Nearly-there Testing

Once your code is mostly complete, you should be able to run `python3 demoserver.py` and then 

- open <http://127.0.0.1/index.html> to see a simple chat tool.
- open <http://127.0.0.1/> to be redirected to <http://127.0.0.1/belloc/microbe.html> to see an illustrated poem.

The browser sends more complicated HTTP requests with many more headers than curl, but should generally work the same.

## Final Testing

```sh
python3 -m pytest
```

will run a set of automated tests. These should all pass.
Adding `-v` will output more verbose results.

```sh
make test
```
will run the same automated tests but also give you your projected score on the MP.



