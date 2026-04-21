from aiohttp import web, WSMsgType
import asyncio
import tilestub
import json

routes = web.RouteTableDef()

allws = {} # used to track open websockets to support graceful shutdown on Ctrl+C

tets = (
    (
        ((0,0),(1,0),(0,-1),(1,-1)),   # 1,0 = O
    ),
    (
        ((0,0),(0,-1),(0,-2),(0,-3)),  # 2,0 = tall I
        ((-1,0),(0,0),(1,0),(2,0)),    # 2,1 = wide I
    ), 
    (
        ((-1,-1),(0,-1),(1,-1),(0,0)), # 3,0 = top-up T
        ((-1,-1),(0,-1),(0,-2),(0,0)), # 3,1 = top-right T
        ((-1,0),(0,0),(1,0),(0,-1)),   # 3,2 = top-down T
        ((0,0),(0,-1),(0,-2),(1,-1)),  # 3,3 = top-left T
    ),
    (
        ((0,-2),(0,-1),(0,0),(1,0)),   # 4,0 = top-up L
        ((0,0),(0,-1),(1,-1),(2,-1)),  # 4,1 = top-right L
        ((-1,-2),(0,-2),(0,-1),(0,0)), # 4,2 = top-down L
        ((-1,0),(0,0),(1,0),(1,-1)),   # 4,3 = top-left L
    ),
    (
        ((-1,0),(0,0),(0,-1),(0,-2)),  # 5,0 = top-up J
        ((0,-1),(0,0),(1,0),(2,0)),    # 5,1 = top-right J
        ((0,0),(0,-1),(0,-2),(1,-2)),  # 5,2 = top-left J
        ((-1,-1),(0,-1),(1,-1),(1,0)), # 5,3 = top-left J
    ),
    (
        ((0,-2),(0,-1),(1,-1),(1,0)),  # 6,0 = tall S
        ((-1,0),(0,0),(0,-1),(1,-1)),  # 6,1 = wide S
    ),
    (
        ((1,-2),(1,-1),(0,-1),(0,0)),  # 7,0 = tall Z
        ((-1,-1),(0,-1),(0,0),(1,0)),  # 7,1 = wide Z
    )
)


@routes.get('/ws')
async def websocket_handler(request : web.Request) -> web.WebSocketResponse:
    """The main event loop: accepts connections, manages games, cleans up"""
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    allws[id(ws)] = ws
    
    # FIX ME: initialize a game for this websocket

    # An aysync loop that waits between getting incoming messages. While
    # it is waiting, other code can run. 
    async for msg in ws:
        if msg.type == WSMsgType.TEXT:
            # FIX ME: process user event from msg.data
        elif msg.type == WSMsgType.ERROR:
            print(f'WebSocket received exception {ws.exception()}')
       
    del allws[id(ws)]
    return ws


@routes.get('/')
async def index(req : web.Request) -> web.FileResponse:
    """A simple method for sharing the index.html with players"""
    return web.FileResponse(path="index.html")

async def shutdown_ws(app: web.Application) -> None:
    """Ctrl+C won't work right unless we close any open websockets,
    so this function does that."""
    for other in tuple(allws):
        await allws[other].close()

def setup_app(app: web.Application) -> None:
    """Registers routes and any setup and shutdown handlers needed
    The default provided with the MP is sufficient"""
    app.on_shutdown.append(shutdown_ws)
    app.add_routes(routes)
    
# To facilitate testing, do not change anything below this line
if __name__ == '__main__': 
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', type=str, default="0.0.0.0")
    parser.add_argument('-p','--port', type=int, default=10340)
    args = parser.parse_args()

    app = web.Application()
    setup_app(app)
    web.run_app(app, host=args.host, port=args.port) # this function never returns
