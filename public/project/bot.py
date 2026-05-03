from aiohttp import web, WSMsgType
import aiohttp, asyncio


async def play_games(client, url):
    """Main game connection and play logic."""
    alltasks.add(asyncio.current_task())
    asyncio.current_task().add_done_callback(taskdone)
    try:
        while True:
            await asyncio.sleep(2) # pause between games; feel free to change this
            try: ws = await client.ws_connect(url)
            except:
                print('Game server at', url, 'did not let the bot play')
                return
            wsoftask[asyncio.current_task()] = ws
            print('Starting a new game')
            async for msg in ws:
                if msg.type == WSMsgType.TEXT:
                    data = msg.json() # parse message from server
                    
                    
                    # replace code starting here
                    if 'event' in data: # game over
                        print('EVENT:', data['event'])
                        await ws.close() # MUST keep this to avoid infinite wait on ended game
                    elif 'next' in data: # 'next' is given when a new tetromino appears
                        await asyncio.sleep(3.4)  # pause to not look AI-like
                        await ws.send_str('drop') # take action
                    # replace code above here
                    
                    
                elif msg.type == WSMsgType.ERROR:
                    print(f'connection to {url} received {ws.exception()}')
            
    except BaseException as ex:
        print("Game terminated with exception:\n   ", type(ex),'\n   ', ex)


# Written by course staff. Do not edit.
routes = web.RouteTableDef()
alltasks = set() # track tasks we might need to cancel if the server stops
wsoftask = {}    # when a task opens a ws, that is added here

def taskdone(task):
    """Written by course staff. Do not edit.
    Helper method to clean up ws and tasks"""
    alltasks.discard(task)
    if task in wsoftask:
        asyncio.create_task(wsoftask[task].close())
        del wsoftask[task]

@routes.get('/')
async def get_html(request):
    """Written by course staff. Do not edit.
    Returns the HTML user interface"""
    return web.FileResponse("botui.html")

@routes.post('/server')
async def play_on_server(request):
    """Written by course staff. Do not edit.
    Connects the bot to a server"""
    url = await request.text()
    alltasks.add(asyncio.create_task(play_games(request.app['client'], url)))
    return web.Response(status=200, text="OK")

@routes.get('/stopall')
async def get_html(request):
    """Written by course staff. Do not edit.
    Returns the HTML user interface"""
    for task in tuple(alltasks):
        try: task.cancel()
        except: pass
    return web.Response(status=200, text="OK")


async def shutdown_ws(app):
    """Cleanup"""
    for task in tuple(alltasks):
        try: task.cancel()
        except: pass

async def startup_client(app):
    """A shared client for better DNS caching"""
    app['client'] = aiohttp.ClientSession()

async def shutdown_client(app):
    """Cleanup"""
    await app['client'].close()


def setup_app(app):
    """Register all the setup and cleanup callbacks"""
    app.on_startup.append(startup_client)
    app.on_shutdown.append(shutdown_ws)
    app.on_shutdown.append(shutdown_client)
    app.add_routes(routes)
    
if __name__ == '__main__': 
    app = web.Application()
    setup_app(app)
    web.run_app(app, host='0.0.0.0', port=41801) # this function never returns
