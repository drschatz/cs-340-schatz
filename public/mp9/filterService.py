from aiohttp.web import Application, run_app, RouteTableDef, Request, FileResponse, StreamResponse, Response
import asyncio
import aiohttp
import tempfile
import datetime
import csv

routes = RouteTableDef()

@routes.get('/')
async def index(req: Request) -> StreamResponse:
    return FileResponse(path="index.html")

@routes.post('/filter')
async def filter_image(req: Request) -> StreamResponse:
    raise UnsupportedOperation("Not yet implemented")


def setup_app(app):
    # put any setup you want to do in this function, not in the global scope
    app.add_routes(routes)


#### DO NOT MODIFY CODE BELOW THIS LINE ####
if __name__ == '__main__':
    app = Application()
    setup_app(app)
    run_app(app, host='0.0.0.0', port=4595)
