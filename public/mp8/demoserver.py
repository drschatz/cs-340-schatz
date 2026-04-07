import web

routes = web.RouteTableDef()

@routes.get("/")
async def redirect_root(request: web.Request) -> web.Response:
  """Status 303 asks the browser to redirect to a different URL"""
  return web.Response(status=303, headers={'Location':'/belloc/microbe.html'})

@routes.get("/belloc") # because these decorators return what they were passed in, we can chain them
@routes.get("/belloc/")
@routes.get("/belloc/microbe.html")
async def redirect_root(request: web.Request) -> web.Response:
  """Content-type HTML changes how the browser renders text.
  The open().read() approach is not very efficient for asyncio, but works well enough for testing."""
  return web.Response(text=open("belloc/microbe.html").read(), content_type='text/html; charset=utf-8')

@routes.get("/belloc/microbe1.png") # three handlers for three files with one method
@routes.get("/belloc/microbe2.png")
@routes.get("/belloc/microbe3.png")
async def redirect_root(request: web.Request) -> web.Response:
  """Passing in binary (not text) data, with path-based file path"""
  return web.Response(body=open(request.path[1:],'rb').read(), content_type='image/png')


@routes.get("/340.png")
async def redirect_root(request: web.Request) -> web.Response:
  """A file path that doesn't match the resource path"""
  return web.Response(body=open('chat/340.png','rb').read(), content_type='image/png')

@routes.get("/index.html")
async def redirect_root(request: web.Request) -> web.Response:
  """Two methods, one path; this is the GET method"""
  return web.Response(text=open('chat/index.html').read(), content_type='text/html; charset=utf-8')

messages = []
@routes.post("/index.html")
async def accept_chat(request: web.Request) -> web.Response:
  """Two methods, one path; this is the POST method"""
  import time
  data = await request.json()
  old = data['have']
  messages.append(data['msg'])
  return web.json_response(messages[old:])
   

if __name__ == '__main__':
    app = web.Application()
    app.add_routes(routes)
    web.run_app(app) # this function never returns
