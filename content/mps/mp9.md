---
title: MP9
subtitle: Weather-based Image Filter
author: Luther Tychonievich
---

In this Meteorological Pumpkin (MP) you will learn how to use Python to tie multiple other services together.
In particular, you will use

- a C program we provide
- a data file we provide
- a webservice provided by the National Weather Service

and wrap these all in a webservice you create.

The service you create will accept an image and location;
look up the weather at that location;
modify the image based on the weather;
and send the modified image back.
It will do all of this over the Internet.

# Initial Files

[`mp9.zip`](../mp9.zip) contains the C program, data file, `Makefile`, and tests.

You will modify and submit `filterService.py` on your VM.

The zip file also contains a script you might find helpful when working with your VM:

- `vmpoweron.sh` helps turn on your virtual machine.

# Specification

## Creating a web service

You will use `asyncio` to create a web service.
The starter file has some of the `aiohttp` plumbing written for you,
but you'll need to write most of it yourself.

Your web service should have two endpoints:

Sending a request with method `GET` to path `/`
should return a response with contents of the supplied `index.html`.

Sending a request with method `POST` to path `/filter`
with a message body being a multipart form with a file in field `png` containing a PNG image
and a location in field `location` containing a city name
should return a response with a modified PNG image.

The modification should use the provided `filter` program
with an effect selected based on the current temperature^[NWS doesn't actually report current temperatures, but it does report hourly forecasts; we'll take the first hourly forecast at a location as the current temperature]
in the provided location:

| Temperature | Effect      |
|:-----------:|:-----------:|
| ≥ 80°F      | `hazy`      |
| 61–79°F     | `vibrance`  |
| ≤ 60°F      | `blue tint` |

Because the response is a PNG image,
it should have the `image/png` content type header.

Various things can go wrong with `/filter`:

- If the location is not in the data we provide, use Champaign, Illinois's location of latitude 40.1164, longitude -88.2434.
- If the weather service doesn't have data for the location, use 70°F instead.
- If the program can't handle the image file provided (as witnessed by its return code), return [status code 415](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/415) and no message body.

### Choosing a response type

There are four types of `Response` objects you can use in aiohttp;
two might be useful for this MP.

1. A plain [`Response`](https://docs.aiohttp.org/en/stable/web_reference.html#aiohttp.web.Response) can have an arbitrary `body`, `status` code, and `content_type`.

1. A [`FileResponse`](https://docs.aiohttp.org/en/stable/web_reference.html#aiohttp.web.FileResponse) creates a response from a file specified by its `path` on your local drive, setting the content type based on the file extension (i.e. if the file path ends `.png` it uses content type `image/png` regardless of what the file contains.

`FileResponse` can make handling path `/` very simple:

```py
@routes.get('/')
async def index(req : Request) -> StreamResponse:
    return FileResponse(path="index.html")
```

`FileResponse` might also be useful for responding to `/filter`, depending on how you pick file names, but if you need to set the content type manually you'll need to use `Response` instead.

`Response` and `FileResonse` are both subtypes of `StreamResponse`.
If you want to check type annotations with `mypy` or `pyright`,
`StreamResponse` is the better type to use for the return type of aiohttp methods.


### Reading request content 

The standard way to send a file with additional information to a web service
is to use a somewhat strange, old tool called a multipart message body.
That format splits the message body into a sequence of parts, separated by random strings including many hyphens;
each part has headers like an HTTP message would, followed by its own body.

Fortunately, aiohttp can parse all of this for us.

The usual structure to read data that was submitted as field name `bazzle` is

```py
async def my_aiohttp_function(req : Request) -> Response:
    multi = await req.multipart()
    data = None
    async for part in multi:
        if part.name == 'bazzle':
            data = await part.read()
```

Note that you must use `async for` because each iteration might block while waiting for more data to come over the network,
and also must `await` the `read()` inside the loop because the next loop iteration will skip past any data you haven't `await`ed and stored in a variable.
The result is type `bytes`, not `str`; if you expected a `str` you'll need to `decode()` it.


### Working with files in `async` code

If you need to read from or write to a file in `async` code, such as code used by `aiohttp`,
performance is improved significantly by using
[`asyncio.to_thread`](https://docs.python.org/3/library/asyncio-task.html#asyncio.to_thread).
In particular, write a non-async function that does the file work
and call that function with `asyncio.to_thread`, like so:

```py
def save_file_helper(data, save_as):
    directory = os.path.dirname(save_as)
    os.makedirs(directory, exist_ok=True)
    open(save_as, 'wb').write(data)
await asyncio.to_thread(save_file_helper, mydata, my_destination_path)
```

We won't enforce doing this in this MP: if you use `open` and so on directly in your code you'll still get full points.
That said, using `to_thread` for file operations will make your code faster if you try to do many file operations concurrently, for example by getting a hundred of our friends to all access your application simultaneously.


## Using a C program

We provide a C program named `filter.c`.
The provided `Makefile` will compile this and save it as `filter`,
which is a command-line program.
As with many command-line programs,
running it with no arguments (`./filter`) or with a help argument (`./filter --help` or `./filter -h`) will show a summary of how to use the program.

You will need to run this program from inside your Python code.
Python has at least half a dozen tools for this, each suited to a different context.
When writing async functions such as are used for `aiohttp` servers, the best tool is [`asyncio.create_subprocess_shell`](https://docs.python.org/3/library/asyncio-subprocess.html)
(or it's close cousin [`asyncio.create_subprocess_exec`](https://docs.python.org/3/library/asyncio-subprocess.html)).
You should not use any of the non-async functions found in other packages for this purpose.
The documentation of `asyncio.create_subprocess_shell` has examples which also uses `asyncio.run`;
you should *not* use `asyncio.run` because aiohttp handles that itself (via `run_app`).

You should ensure your code works correctly
even if two simultaneous requests arrive that need to call `./filter` with different images and effects.
One way to avoid file name conflicts in concurrent requests
is to have each request work in its own temporary directory,
such as can be created with [`tempfile.TemporaryDirectory`](https://docs.python.org/3/library/tempfile.html).

### TemporaryDirectory and FileResponse

One of TemporaryDirectory's strengths is that is cleans up after itself,
deleting the directory and everything in it when the `with` statement closes.

One of FileResponse's strengths is that it reads the file only as needed,
reading one IP packet worth of data from it at a time.
`FileResponse(path="some/file.png")`
is an optimized version of `Response(body=open("some/file.png", "rb").read(), content_type="image/png")`.

But those two strengths are not compatible with one another.
If you have

```py
with TemporaryDirectory() as tmpdir:
    ... # do work here
    return FileResponse(path=tmpdir+'/myfile.txt')
```

then the order of operations is:

1. The temporary directory path is stored in the FileResponse object.
2. The function returns, leaving the `with` block and deleting the directory.
3. aiohttp tries to read the file referenced in the FileResponse object and fails.

Because TemporaryDirectory provides functional correctness
(preventing concurrent accesses from colliding with one another)
but FileResposne provides only resource optimization,
we should keep the TemporaryDirectory, not the FileResponse;
instead, we should use a Response object and pass the file contents in as its body,
reading those file contents before the `with` is exited..


## Using a data file

We provide a data file named `cities.csv`.
This contains a table of data about over 5,000 cities
in the popular CSV format, formally defined in [RFC 4180](https://www.rfc-editor.org/rfc/rfc4180).
However, you won't need to understand the formal definition
because CSV is handled by a built-in Python library module [`csv`](https://docs.python.org/3/library/csv.html)
which you can use to read the data inside your program.

The information you will need from the file is the latitude (`lat`) and longitude (`lng`) of a given location, looked up by the location.
Locations are specified by their name transliterated into ASCII (`city_ascii`),
a comma and space,
and then the state or other administrative unit the city is within (`admin_name`):
like `Champaign, Illinois` or `Washington, District of Columbia`.

### Efficiency space-time tradeoff 

Many computing tasks have multiple ways they can be done,
some of which are faster (more time efficient)
and others of which use less memory (more space efficient).
Accessing the data file is an example of that tradeoff.

If you read the entire file once, storing the information in a `dict` or other fast data structure,
then looking up each location will be very fast,
at the cost of storing the entire dataset in memory.

If you read through the file anew for each location accesses
then looking up each location will be slower,
but very little data will be stored in memory.

For this MP, the dataset is small enough to fit in memory
and the performance requirements are loose enough you can be slow if you wish.


## Using a web service

The [National Weather Service (NWS) API](https://www.weather.gov/documentation/services-web-api)
has a variety of API endpoints (URLs you can request data from).
In general, you'll need to access two of these to learn the weather of a given location,
where the first request will give to the endpoint to use for the second request.

To send requests to the API, refer to the [aiohttp client quickstart](https://docs.aiohttp.org/en/stable/client_quickstart.html).
Note the example there uses two nested `async with` statements:
you need both, nested in that order, and can't return the `resp` directly.
Also note that the [`resp` is a ClientResponse](https://docs.aiohttp.org/en/stable/client_reference.html#aiohttp.ClientResponse) and has other methods you might find helpful as well.

### SSL Errors

When calling the NWS API, you need to use HTTPS, not HTTP.
HTTPS uses certificates so you know you are contacting the correct server
and also uses encryption so you know your messages are not being read or tampered with along the way.

Some students have reported errors connecting to these pages
because of a mismatch between their installed SSL certificates and those used by the NWS.

You might be able to fix this by installing `certifi` as either `sudo apt install python3-certifi` or `python3 -mpip install certifi`.

You can also bypass certificate checking entirely.
Bypassing this is dangerous in general,
opening you to getting faked repleis from malicious servers pretending to be the NWS,
but for this MP the risk is minimal.
If you can't get certificates working, you can remove certificate checking
by changing your ClientSession constructor to be

```py
aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False)) # INSECURE!
```

### Rate limiting

This NWS API includes the following note in its documentation:

> there are reasonable rate limits in place to prevent abuse and help ensure that everyone has access. The rate limit is not public information, but allows a generous amount for typical use. If the rate limit is execeed a request will return with an error, and may be retried after the limit clears (typically within 5 seconds).

The "rate limits" referred to in this quote count how many requests a single entity sends to the API in a given time window.

Using this MP as a single user, you probably won't run into this limit,
but there are three cases that could:

- Our automated tests run many tests, and doing so quickly could hit the limit. Because of this, each test includes an explicit delay to slow down testing.
- If you shared the webservice you create in this MP with others, many concurrent users could cause the limit to be reached.
- If many students all run their tool while attached to the same router, they will all look like the same user to the NWS.


# Testing

We suggest the following sequence of testing steps:

1. Run `python3 filterService.py` on your personal machine and then visit <http://localhost:4595/> and put in images and locations to see what comes back.

2. Run `python3 -m pytest -vv` to get detailed output from our automated tests.
    
    Most of the automated tests primarily run in two passes:
    first a set of image/location pairs are run through your code,
    and then the filters applied are checked against a checking server we are running.
    
    This command contacts a VM on campus, which means you must either **be on campus or use the VPN** for it to work. See <https://answers.uillinois.edu/illinois/98773> for more on the VPN.

3. Move your files to your VM (see MP 1 for instructions)

4. Run `python3 filterService.py` on your virtual machine and then visit `http://fa25-cs340-`###`.cs.illinois.edu:4595/` (replacing ### with your VM number) and put in images and locations to see what comes back.

5. Run `python3 -m pytest -vv` on your virtual machine.


## Grading

To submit this MP you need to upload your code to your VM before the deadline in a folder called MP9. My script will look for MP9/filterService.py on your VM.
