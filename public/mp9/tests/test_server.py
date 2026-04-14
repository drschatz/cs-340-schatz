import pytest
import aiohttp
import asyncio
from aiohttp import web
import filterService

meaning = {
    open('tests/hot.png','rb').read(): 'hot',
    open('tests/mild.png','rb').read(): 'mild',
    open('tests/cold.png','rb').read(): 'cold',
}
got = {}
res = {}

async def test_root(aiohttp_client):
    app = web.Application()
    filterService.setup_app(app)
    client = await aiohttp_client(app)
    resp = await client.get('/')
    assert resp.status == 200
    assert resp.content_type == 'text/html'
    assert await resp.text() == open('index.html').read()

@pytest.mark.parametrize("location", [
    'Hilo, Hawaii',
    'Key Largo, Florida',
    'Fairbanks, Alaska',
    'Marquette, Michigan',
    'Kittery, Maine',
    'San Diego, California',
    'Washington, District of Columbia',
    'Palo Alto, California',
])
async def test_locations(aiohttp_client, location):
    app = web.Application()
    filterService.setup_app(app)
    client = await aiohttp_client(app)
    data = aiohttp.FormData()
    data.add_field('png',
        open('tests/base.png','rb'),
        filename='base.png',
        content_type='image/png')
    data.add_field('location', location)
    resp = await client.post('/filter', data=data)
    assert resp.status == 200
    assert resp.content_type.startswith('image/')
    got[location] = meaning.get(await resp.read())
    assert got[location] is not None, location+' should use a known filter'
    await asyncio.sleep(0.5)

async def test_results():
    global res
    async with aiohttp.ClientSession() as session:
        async with session.post('http://fa25-cs340-s20.cs.illinois.edu:34008/check', json=got) as resp:
            res = await resp.json()

@pytest.mark.parametrize("location", [
    'Hilo, Hawaii',
    'Key Largo, Florida',
    'Fairbanks, Alaska',
    'Marquette, Michigan',
    'Kittery, Maine',
    'San Diego, California',
    'Washington, District of Columbia',
    'Palo Alto, California',
])
async def test_results_2(location):
    assert res[location] == 'OK', location+' filter: '+res[location]

