import pytest

from asyncio import StreamReader, StreamWriter
from typing import Callable, Awaitable

def assertSameMessage(got,expected, startParts=2, skipHeaders=False, skipBody=False):
  assert b'\r\n\r\n' in got, 'end of headers found'
  if startParts:
    if startParts > 0:
      assert got[:got.find(b'\r\n')].split(b' ',2)[:2] == expected[:expected.find(b'\r\n')].split(b' ',2)[:2], 'start line'
    else:
      assert got[:got.find(b'\r\n')] == expected[:expected.find(b'\r\n')], 'start line'
  if skipHeaders == 'inclusive':
    gh = got[got.find(b'\r\n'):got.find(b'\r\n\r\n')].replace(b'\r',b'')
    bh = expected[expected.find(b'\r\n'):expected.find(b'\r\n\r\n')].replace(b'\r',b'')
    for e in bh:
      assert e in gh
  if not skipHeaders:
    gh = got[got.find(b'\r\n'):got.find(b'\r\n\r\n')].replace(b'\r',b'')
    bh = expected[expected.find(b'\r\n'):expected.find(b'\r\n\r\n')].replace(b'\r',b'')
    assert sorted(gh.split(b'\n')) == sorted(bh.split(b'\n')), 'headers'
  if not skipBody:
    assert expected[expected.find(b'\r\n\r\n'):] == got[got.find(b'\r\n\r\n'):], 'message body'
  

def test_types():
  import web
  import asyncio
  assert isinstance(web.Response, type)
  assert isinstance(web.Request, type)
  
  assert isinstance(web.Request, type)
  assert isinstance(web.Request.method, property)
  assert not asyncio.iscoroutinefunction(web.Request.method)
  assert isinstance(web.Request.path, property)
  assert not asyncio.iscoroutinefunction(web.Request.path)
  assert isinstance(web.Request.headers, property)
  assert not asyncio.iscoroutinefunction(web.Request.headers)
  assert isinstance(web.Request.text, Callable)
  assert asyncio.iscoroutinefunction(web.Request.text)
  assert not isinstance(web.Request.text, property)

  assert isinstance(web.Application, type)
  assert asyncio.iscoroutinefunction(web.Application.serve)

  assert isinstance(web.run_app, Callable)
  assert not asyncio.iscoroutinefunction(web.run_app)


@pytest.mark.parametrize("kargs,blob", [
({},{0:b'HTTP/1.1 200 OK\r\nContent-Length: 0\r\n\r\n'}),
({'body':b'this is a test'},{0:b'HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: 14\r\n\r\nthis is a test'}),
({'text':'this is a test'},{0:b'HTTP/1.1 200 OK\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 14\r\n\r\nthis is a test'}),
({'text':'{}','content_type':'application/json'},{0:b'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 2\r\n\r\n{}'}),
({'text':'<b>Hi!</b>','content_type':'text/html; charset=utf-8'},{0:b'HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: 10\r\n\r\n<b>Hi!</b>'}),
({'status':404},{0:b'HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\n\r\n'}),
({'status':500,'text':'Oops!'},{0:b'HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 5\r\n\r\nOops!'}),
({'status':302,'text':'Moved','headers':{'Location':'http://example.com/nothing','Test':'true'}},{0:b'HTTP/1.1 302 Found\r\nLocation: http://example.com/nothing\r\nTest: true\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Length: 5\r\n\r\nMoved'}),
])
def test_responses(kargs, blob):
  from web import Response
  got = bytes(Response(**kargs))
  blob = blob[0]
  assertSameMessage(got, blob)

def apprunner():
  """Returns a generator that
  1. yields an app
  2. runs the app in a background process and yields its port
  3. shuts down the background process
  """
  import multiprocessing
  import time
  import random
  from web import Application, run_app
  app = Application()
  yield app
  port = random.randrange(49152, 65536)
  mp = multiprocessing.Process(target=lambda: run_app(app, port=port))
  mp.start()
  time.sleep(0.5)
  yield port
  mp.terminate()

def sendmsgs(port, *msgs):
  from socket import socket, AF_INET, SOCK_STREAM
  with socket(AF_INET, SOCK_STREAM) as con:
    con.connect(('localhost', port))
    con.settimeout(0.5)
    for msg in msgs:
      con.send(msg)
    ans = []
    while True:
      try: bit = con.recv(4096)
      except TimeoutError: break
      if not bit: break
      ans.append(bit)
  return b''.join(ans)

def test_no_routes():
  g = apprunner()
  app = next(g)
  port = next(g)
  try:
    res = sendmsgs(port, b'GET / HTTP/1.1\r\n\r\n')
    expect = b'HTTP/1.1 404\r\nContent-Length: 0\r\n\r\n'
    assertSameMessage(res,expect)
  finally:
    try: next(g)
    except StopIteration: pass

def test_chopped_message():
  g = apprunner()
  app = next(g)
  port = next(g)
  try:
    res = sendmsgs(port, b'G',b'ET / HTTP/1.1\r',b'\n\r\n')
    expect = b'HTTP/1.1 404\r\nContent-Length: 0\r\n\r\n'
    assertSameMessage(res,expect)
  finally:
    try: next(g)
    except StopIteration: pass

def test_several_message():
  g = apprunner()
  app = next(g)
  port = next(g)
  try:
    res = sendmsgs(port, b'GET / HTTP/1.1\r\n\r\nPOST /demo HTTP/1.1\r\nContent-Length: 4\r\n\r\nnopeDELETE / HTTP/1.1\r\n\r\n')
    assert res.count(b'\r\n\r\n'), 'three requests gets three responses'
    expect = b'HTTP/1.1 404\r\nContent-Length: 0\r\n\r\n'
    for bit in res.split(b'\r\n\r\n')[:3]:
      assertSameMessage(bit+b'\r\n\r\n',expect)
  finally:
    try: next(g)
    except StopIteration: pass


@pytest.mark.parametrize("path,ok", [
(b'/',True),
(b'/more/path',True),
(b'/other',False),
(b'/more',False),
(b'/more/path/parts',False),
])
def test_show_path(path,ok):
  from web import Request, Response, RouteTableDef
  routes = RouteTableDef()

  @routes.get('/')
  @routes.get('/more/path')
  async def show_path(request: Request) -> Response:
    return Response(text=request.path)
  
  g = apprunner()
  app = next(g)
  app.add_routes(routes)
  
  port = next(g)
  try:
    res = sendmsgs(port, b'GET '+path+b' HTTP/1.1\r\n\r\n')
    if ok:
      expect = b'HTTP/1.1 200\r\n\r\n'+path
      assertSameMessage(res,expect,skipHeaders=True)
    else:
      expect = b'HTTP/1.1 404\r\nContent-Length: 0\r\n\r\n'
      assertSameMessage(res,expect)
  finally:
    try: next(g)
    except StopIteration: pass


@pytest.mark.parametrize("req,expect", [
(b'GET / HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 303\r\nLocation: /belloc/microbe.html\r\n\r\n'}),
(b'GET /index.html HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 200\r\nContent-Type: text/html\r\n\r\n'+open('chat/index.html','rb').read()}),
(b'GET /belloc/microbe.html HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 200\r\nContent-Type: text/html\r\n\r\n'+open('belloc/microbe.html','rb').read()}),
(b'GET /340.png HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 200\r\nContent-Type: image/png\r\n\r\n'+open('chat/340.png','rb').read()}),
(b'GET /belloc/microbe3.png HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 200\r\nContent-Type: image/png\r\n\r\n'+open('belloc/microbe3.png','rb').read()}),
(b'GET /belloc/microbe4.png HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 404\r\n\r\n'}),
(b'GET /microbe3.png HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 404\r\n\r\n'}),
(b'GET /chat/index.html HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 404\r\n\r\n'}),
(b'GET /index.html/ HTTP/1.1\r\n\r\n',{0:b'HTTP/1.1 404\r\n\r\n'}),
])
def test_demoserver(req,expect):
  import demoserver
  g = apprunner()
  app = next(g)
  app.add_routes(demoserver.routes)
  expect = expect[0]
  port = next(g)
  try:
    res = sendmsgs(port, req)
    assertSameMessage(res,expect,skipHeaders='inclusive')
  finally:
    try: next(g)
    except StopIteration: pass




def test_demoserver_chat_1():
  import demoserver
  g = apprunner()
  app = next(g)
  app.add_routes(demoserver.routes)
  port = next(g)

  try:
    res = sendmsgs(port, b'POST /index.html HTTP/1.1\r\nContent-Type: application/json\r\nContent-Length: 20\r\n\r\n{"msg":"x","have":0}')
    assertSameMessage(res,b'HTTP/1.1 200\r\nContent-Type: application/json\r\n\r\n["x"]',skipHeaders='inclusive')
  finally:
    try: next(g)
    except StopIteration: pass


def test_demoserver_chat_2():
  import demoserver
  g = apprunner()
  app = next(g)
  app.add_routes(demoserver.routes)
  port = next(g)

  try:
    res = sendmsgs(port, b'POST /index.html HTTP/1.1\r\nContent-Type: application/json\r\nContent-Length: 20\r\n\r\n{"msg":"x","have":0}')
    res = sendmsgs(port, b'POST /index.html HTTP/1.1\r\nContent-Type: application/json\r\nContent-Length: 20\r\n\r\n{"msg":"y","have":1}')
    assertSameMessage(res,b'HTTP/1.1 200\r\nContent-Type: application/json\r\n\r\n["y"]',skipHeaders='inclusive')
    res = sendmsgs(port, b'POST /index.html HTTP/1.1\r\nContent-Type: application/json\r\nContent-Length: 21\r\n\r\n{"msg":"zw","have":0}')
    assertSameMessage(res,b'HTTP/1.1 200\r\nContent-Type: application/json\r\n\r\n["x", "y", "zw"]',skipHeaders='inclusive')
  finally:
    try: next(g)
    except StopIteration: pass


