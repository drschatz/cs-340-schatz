"""
In this file, we implement a core subset of what aiohttp does.
In particular, we implement

    class RouteTableDef
        def post
        def get

    class Application
        def add_routes

    class Request
        headers
        method
        path
        async def text
        async def json

    class Response
        def __init__(text=, status=, content_type=, headers=)

    def json_response(data=, status=)
    def run_app(app, host=, port=)

To make these work, we also implement some HTTP parsing code.
The starting code also has some helpers to get more useful error messages than asyncio normally provides.

This code should appear to *do nothing* when it is run as an application.
It is a library to be used by other applications only.
"""

import asyncio
import json
from typing import Callable, Awaitable, Tuple, Any

reason_phrases = { # from the HTTP spec; no need to edit
  100: "Continue",
  101: "Switching Protocols",
  102: "Processing",
  103: "Early Hints",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  207: "Multi-Status",
  208: "Already Reported",
  226: "IM Used",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  307: "Temporary Redirect",
  308: "Permanent Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a teapot",
  421: "Misdirected Request",
  422: "Unprocessable Content",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  451: "Unavailable For Legal Reasons",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
}



class Response:
    """An HTTP response; use bytes(response) to encode for transport to a client."""
    def __init__(self, *,
                 status: int = 200,
                 text: str|None = None,
                 body: bytes|None = None,
                 headers: dict[str,str]|None = None,
                 content_type: str|None = None,
                ):
        raise NotImplemented("FIX ME: implement this method")

    def __bytes__(self) -> bytes:
        """Encode this response as a bytes object suitable for using in writer.write()"""
        raise NotImplemented("FIX ME: implement this method")

def json_response(data: Any, *, 
                  status: int = 200, 
                  headers: dict[str,str] = {}, 
                  content_type: str = 'application/json', 
                  dumps : Callable[[Any], str] = json.dumps
                 ):
    """A simple helper function to sending JSON-formatted responses"""
    return Response(text=dumps(data), status=status, headers=headers, content_type=content_type)


class Request:
  """An HTTP request, parsed for server code processing."""
  def __init__(self):
    """Only invoked internally by code you write"""
    raise NotImplemented("FIX ME: implement this method, likely adding arguments as well")

  @property
  def method(self) -> str:
    """HTTP request method as a string, as given in the start line"""
    raise NotImplemented("FIX ME: implement this property")
  
  @property
  def path(self) -> str:
    """Path from start line, up to but not including its first ? character."""
    raise NotImplemented("FIX ME: implement this property")
  
  @property
  def headers(self) -> dict[str, str]:
    """Headers as a dict of strings (ignore duplicate keys)"""
    raise NotImplemented("FIX ME: implement this property")
  
  async def text(self) -> str:
    """The message body, decoded as a UTF-8 string"""
    raise NotImplemented("FIX ME: implement this async method")

  async def json(self, *, loads:Callable[[str], Any] = json.loads) -> Any:
    """The message body, decoded as JSON"""
    return loads(await self.text())



HandlerType = Callable[[Request], Awaitable[Response]]

class RouteTableDef:
    """Several hoops to let us decorate functions with the web path that they handle"""
    routes: dict[Tuple[str,str], HandlerType] # for example, {('GET','/index.html'): functionToCall}
    def __init__(self):
        """Initialize with no know routes"""
        self.routes = {}
    def get(self, path: str):
        """returns a decorator function"""
        def wrapper(callback: HandlerType) -> HandlerType:
            """A decorator function that remembers the method and path of a function"""
            self.routes[('GET',path)] = callback
            return callback
        return wrapper
    def post(self, path: str):
        """returns a decorator function"""
        def wrapper(callback: HandlerType) -> HandlerType:
            """A decorator function that remembers the method and path of a function"""
            self.routes[('POST',path)] = callback
            return callback
        return wrapper


class Application:
    def __init__(self):
        raise NotImplemented("FIX ME: implement this constructor")
        
    def add_routes(self, routes: RouteTableDef) -> None:
        """Provides a set of routes for the server"""
        raise NotImplemented("FIX ME: implement this async method")

    async def serve(self, reader:asyncio.StreamReader, writer:asyncio.StreamWriter) -> None:
        """Don't call this directly; used internally by run_app
        Parses HTTP requests,
        converts them to Request objects,
        directs them to the appropriate handler,
        converts the response to bytes
        and sends the response to the requestor.
        """
        raise NotImplemented("FIX ME: implement this async method")
        

def run_app(app: Application, host: str = "127.0.0.1", port: int = 5000) -> None:
    """
    Runs an application forever (does not return unless it crashes).
    Most of the complexity of this function is designed to help you see async error messages quickly.
    
    This function is fully implemented for you; you should not edit it in any way.
    """

    async def show_errors(reader:asyncio.StreamReader, writer:asyncio.StreamWriter) -> None:
        """Wraps app.serve with augmented error handling"""
        try:
            await app.serve(reader, writer)
        except:
            import traceback
            print(traceback.format_exc())
            writer.write(b'HTTP/1.1 500 Internal Server Error\r\nContent-Length: 15\r\n\r\nServer crashed!')
            await writer.drain()
            writer.close()
    
    async def server() -> None:
        """Wraps show_errors in asyncio TCP/IP handling"""
        srv = await asyncio.start_server(show_errors, host=host, port=port)
        print(f'======== Running on http://{host}:{port} ========')
        print('(Press CTRL+C to quit)')
        try:
            await srv.serve_forever()
        except asyncio.CancelledError:
            pass

    try:
        asyncio.run(server())
    except KeyboardInterrupt:
        pass

