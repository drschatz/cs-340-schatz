---
title: Final Project
subtitle: Distributed Text-Based Adventure
author: Luther Tychonievich
---
### Important due dates and logistics
Submit code on Prairie Learn by December 15th 6:59pm (before the check-off) and verify your solution gets a 100% score on the grader locally.

On December 15th plan to attend the check off from 7pm to 10pm (the time given by the registrars' office). We will meet in our normal classroom 2079 Natural History Building. 
- Bring a laptop
- Bring a charger
- Arrive with your working code already on your VM (use scp to transfer files if you developed locally)

Note - The check-off requires you to interact with the code other students wrote, this might be frustrating at times if their code doesn't work. In a way that is the point of the final project (working in a distributed setting). Please remain patient.

Scoring - To recieve ANY points for the final project you need to attend the full check-off period (you may be able to leave early but plan on staying the whole time). If you are sick or face other extenuating circumstances please email me. 

# Distributed Text-Based Adventure

Our final project is a distributed text-based adventure game
in the spirit of [Colossal Cave](https://rickadams.org/adventure/advent/) or [Zork](https://www.web-adventures.org/cgi-bin/webfrotz?s=ZorkDungeon).
A player types commands like `go north` or `take key` and reads what happens.

You will write one web server, called a **domain**, that is one region of a text-based adventure game.
Every student's domain is joined into a single shared world by a central **hub** server that we provide.

The code involves a few HTTP endpoints, some per-user state, and many `if` statements. 

Big Picture:
- You will design and implement your own domain: its locations, its items, and its puzzles.
- Some of your items are hidden in other, nearby domains, and your domain hides items for them in return. Players have to travel between domains to complete puzzles.
- During the check-off, every domain in the class is connected to one hub and you play each other's work.

### Learning Goals
1. Get practice thinking about and designing a server that tracks multiple users.
2. Experience the joys and frustrations of writing distributed code. That is code that interacts and depends on other people's code.

### Demo
Before starting the project we recommend trying out a sample solution. DEMO DOMAIN WILL BE ADDED BY 2:00pm Nov 19th.

Try running commands like `help` or `go west`. 

Note you need to be on campus wifi or a VPN for it to work. Your own domain must be significantly different from this solution domain.

# Recommended Steps
1. Read through the specifications. It's okay if things are a bit confusing, you will refer back to the instructions often as you continue through these steps.
2. Write `/newhub` with your domain's name and a few items. Test it out with the practice hub and web UI to see your welcome message. 
3. Write `/arrive` so that it creates a fresh copy of your game state when a new user arrives. You will go back and edit this function as you add more features.
4. Make `look` and `go` work in the `/command` endpoint for two locations. 
5. Place an item when a user arrives, list it in `look`, make `take` work, and make the verbs work for the item. 
6. Write `/dropped` and make sure it works in all locations with your items.
7. [Organize your code](#organizing-your-code) to help make further edits easier! 
8. Add more content, all your items and locations. 
9. Write `/depart`.
10. Place hosted items when a user arrives either in an open location or behind a barrier. 
11. Add a win condition and send `/score`
12. Write walkthrough.txt and test your code

For each step, use the web UI along with `make grade`to test the code.

### Testing each step with the web UI
1. Run `make start`. It starts the practice hub and your domain and prints two URLs.
2. Open the hub's URL in a browser.
3. The hub starts in setup mode. Type your domain's URL into the page to register it, then type `play`.
4. Test out your domain.

Open the page in two browser tabs to play as two different users at once.


# Initial files

[project.zip](../project.zip) contains

- `newdomain.py`, a skeleton of your domain. **This is the only code file you edit and submit.**
- `hub.py`, a practice hub that supports one domain and simulates the rest of the world
- `tba.html`, the web UI served by the practice hub
- `grade.py`, the autograder
- `Makefile`, with `make start`, `make grade`, `make background`, and `make stop`

You will also create and submit a file called `walkthrough.txt`.

You can either develop the code locally or on your VM directly. Either way, for the check-off, you need your code on your VM. For help using the VM see the environment check-off page.

# How the game works

## Three programs

1. The **web UI** is a web page, provided for you.

    - Shows text to the player and accepts what they type
    - Cleans up what they type into a list of words
    - Sends each command to the hub or to the domain the player is in

2. The **Practice hub** is a Python server, provided for you.

    - Registers domains and logs in players
    - Tracks where every item is: carried by a player, or sitting in some location of some domain
    - Moves players between domains

3. A **domain** is a Python server, written by you.

    - Tracks where each player is inside the domain and what they have changed there
    - Answers most of the player's commands

## Two kinds of travel

Each domain has several **locations**.
Players move between locations in a domain with `go` and one of four directions: north, south, east, west.

Players move between domains with `journey`.
The hub handles `journey`, so your domain never sees that command.
Instead the hub tells the old domain the player `/departed` and tells the new domain the player `/arrived`.

## Items
Your domain defines 4 or more items. These items may trigger events in your domain. For example, a rusty key might unlock a treasure chest that holds a gold coin. An item is something a player can carry: pick it up with `take`, put it down with `drop`, and use it with verbs like `rub lamp`.
Each item is a small dictionary:

    {"name": "lamp", "description": "A brass lamp.", "verb": {"rub": "Nothing happens."}}

Things that never move, like doors and levers, are not items; your domain keeps track of them itself.
See the Item format section below for more details.

### Hidden items

What makes this game distributed is that some of your items are hidden in *other* domains, and your domain hides items for other domains in return.

Each item you define is one of three kinds, decided by its `hidden` field in its dictionary:

| `hidden` | Where the item ends up | Who places it | How a player gets it |
|---|---|---|---|
| left out | In your domain | You | In your domain however you would like |
| `"open"` | In another domain, out in the open | The other domain | Going to that domain and taking it |
| `"locked"` | In another domain, behind a barrier | The other domain | Finding that domain's open item in yet another domain, then bringing it back to get past the barrier |

Never place one of your own open or locked items in your own domain. These are sent to other domains to hide.
If you want one of your items locked away inside your domain, leave out `hidden` and put it behind a barrier yourself.

Your domain also **hosts** items that belong to other domains.
The hub tells you whether each one is hidden open or locked, which says where you must put it:

| Hosted item is hidden | Where you must put it |
|---|---|
| `"open"` | Somewhere a player can reach using only what is in your domain |
| `"locked"` | Somewhere a player can reach only after they have one of *your* open items, which is hosted in another domain |

Put together, this forces travel.

### Note
Your locked area must open with one of your `"open"` items, never a `"locked"` one.
This is to prevent deadlock.

### Hosted items on the practice hub

The practice hub (hub.py) supports only your domain and pretends there are other domains around it.

- It gives your domain three items to host: a `doodad` hidden open, a `whatsit` hidden locked, and a `trinket` that is one or the other at random.
- `journey` in any direction sends the player on a simulated trip and brings them straight back. Your domain gets a `/depart` and then an `/arrive`.
- On a trip, the player finds your open items the first time, and your locked items once they make a trip while carrying the `doodad`.

On the class hub the items you host are other students' items, with names and ids you cannot predict, and there may be more or fewer of them.
Never write code that looks for `doodad` by name. Always use the ids and `hidden` values the hub gives you.

## Who tracks what

Each player gets their own copy of the whole world.
If one player takes an item, opens a door, or flips a switch, no other player sees any change.

The **hub** tracks where every item is, separately for each player.
Your domain does not keep its own copy; it asks the hub, using the endpoints in the [API reference](#api-reference).

Your **domain** tracks everything else, with one copy per user: which location the user is in, which doors are open, which switches are flipped.
It also remembers each item's definition (name, description, verbs), indexed by id.

# Your domain

## Requirements

Your domain

- has a theme that ties it together. Fantasy and science fiction are fine; random nonsense is not
- is unlike the example domain linked above as the demo.
- has 4 or more locations, each with something in it or something to do
- defines 4 or more items:
    - 2 or more with no `hidden` field, which stay in your domain
    - 1 or 2 open items and 1 or 2 locked items, for other domains to host
- hosts open items somewhere reachable without leaving your domain
- hosts locked items somewhere reachable only with one of your open items. You may get several hosted items of each kind, or none. You can host them in the same place or different places
- can be won, and sends the hub a [`/score`](#score) of 1.0 when it is
- cannot be lost: whatever the user does, they can still finish. If an item can be used up or destroyed, there must be another way forward without it
- can be finished using only information found in the game. Do not depend on the layout of campus or on trivia; if you allude to something outside the game, explain it in the game
- has at least one location that sends the user onward with a `$journey` response, so players can walk out
- keeps two users in two browser tabs completely separate
- answers a departed user with status 409, and a wrong secret with status 403
- says only things appropriate for a classroom

## walkthrough.txt

Your walkthrough shows that a player can finish your domain. The autograder replays it on the practice hub.

`walkthrough.txt` is a list of commands, one per line, exactly as a player would type them.
Blank lines and lines beginning with `#` are ignored.

Played in order by a brand-new user on the practice hub, your walkthrough must

1. take the `doodad` and the `whatsit` that your domain hosts, and
2. win, so that your domain sends `/score` 1.0.

Use `journey` lines for the trips to other domains.
Take the `doodad` before the first `journey` line, to show that it can be reached without leaving.
This is the one place you may refer to hosted items by the practice hub's names.
The [appendix](#appendix-the-example-domain) has a walkthrough for the example domain.

# API reference

## Formats

### Location names

A location name is any string your domain picks, such as `"foyer"` or `"cabinet"`.
The hub never interprets it; it only stores it and gives it back.
Use the same names everywhere: in `/dropped`, `/transfer`, and `/query`.
A location name does not have to be a room; it can be the inside of a cabinet.

### Item format

Items are sent between the hub and domains as JSON objects or as integer ids.
An item object has a subset of these fields:

````py
{ "name": ...        # a single word: lower-case letters, digits, and hyphens, but not just digits
, "description": ... # response to "look item"
, "verb": {...}      # a map of {verb: response to "verb item"}
, "id": ...          # integer id assigned by the hub
, "location": ...    # a value you returned from /dropped or sent to /transfer
, "hidden": ...      # "open" or "locked", or left out; see "Hidden items"
}
````

If the item is `{"name": "widget", "verb": {"open": "It seems to be stuck."}}`,
then `open widget` gets the reply `It seems to be stuck.` when the user is carrying the widget.

Item names are not unique; item ids are. See [Names and ids](#names-and-ids).

## The hub's endpoints

The hub tracks where every item is, so your domain calls these whenever it needs to know or change where an item is:

- When a user's world is created, `/transfer` each of your own items that stay home to the location it starts in.
- At the same time, use `/query` with `hidden` to find which items from other domains you host and whether each is hidden open or locked, then `/transfer` each to your open or locked area.
- When you need to know what is in a location or what the user is carrying, use `/query`.
- When the user takes an item, `/transfer` it to `"inventory"`.
- When the user wins, send `/score`.

Each is a POST to the hub's URL, with a JSON request and response.
The hub sends you its URL, and gives your domain an `id` and a `secret`, when your domain registers in [`/newhub`](#newhub).
Every request needs that `id` and `secret`.

### How to reach the hub's endpoints

The skeleton creates one shared `ClientSession` when the server starts. Use it for every request to the hub, and **do not** make your own:

```py
async with req.app.client.post(url, json={...}) as response:
    data = await response.json()
```

We recommend writing helper functions to make calling each of the following hub endpoints easier. 

### /transfer

Moves an item.

````py
{ "domain": ... # the id the hub gave your domain
, "secret": ... # the secret the hub gave your domain
, "user": ...   # the user whose copy of the world this is
, "item": ...   # an integer item id
, "to": ...     # "inventory", or one of your location names
}
````

Responds with status 200 `{"ok": "Item transferred"}`, or a 400-level status with `{"error": "..."}`.
The hub refuses to

- move an item to where it already is (409)
- take an item out of the user's inventory unless your domain owns it (403)
- move an item the user dropped in another domain (403)

### /query

Asks where items are.

````py
{ "domain": ...   # the id the hub gave your domain
, "secret": ...   # the secret the hub gave your domain
, "user": ...     # the user whose copy of the world this is
, "location": ... # "inventory", or one of your location names
, "hidden": ...   # or instead: "open" or "locked"
}
````

Include either `location` or `hidden`, not both.

- `"inventory"` lists the items the user is carrying.
- Any other location lists the items at that place in your domain.
- `hidden` lists the hosted items of that kind that still need to be placed. Use it once per user, the first time they arrive.

Responds with a list of integer item ids.

### /score

Reports how much of your domain a user has completed.

````py
{ "domain": ..., "secret": ..., "user": ..., "score": 1.0 }
````

Send `1.0` when the user wins. You may send partial scores along the way.
A score never goes down; the hub answers an attempt to lower it with status 409.

## Your endpoints

All use the POST method.
Every request from the hub includes your domain's `secret`.
If it is not the one the hub gave you in `/newhub`, respond with status 403 and do nothing else.

### /newhub

**Called by:** the hub, once during setup, and again if the hub is reset.

**Request:** the hub's URL, as plain text.

**What to do:** POST this JSON object to the hub's `/register` endpoint:

````py
{ "url": whoami         # the base URL of your domain server
, "name": "..."         # the name of your domain
, "description": "..."  # one or two sentences shown to players when they arrive
, "items": domain_items # a list of every item your domain owns
}
````

Include every item a player could ever carry from your domain, hidden or not, including every version of an [item that changes](#optional-flair).
This is the only time you can add items.
Things that never move, like doors and levers, are not items; keep them in your per-user state.

The hub replies with `{"error": ...}` if something went wrong, or else:

````py
{ "id": ...      # the number identifying your domain
, "secret": ...  # a string used to authenticate your domain and the hub to each other
, "items": [...] # item ids, in the same order as the items you sent
}
````

Remember the hub's URL, your id, your secret, and which item got which id.
Then throw away all user and game state, so that the game starts fresh.

**Response:** JSON: `{"ok": "..."}` with a message for the person registering, or a non-success status with `{"error": "..."}`.

### /arrive

**Called by:** the hub, each time a user logs into your domain or journeys into it.

**Request:**

````py
{ "secret": ...    # the same string as from /newhub
, "user": ...      # a number identifying the user
, "from": ...      # "login", "north", "south", "east", "west", or "direct"
, "owned": [...]   # items from this domain in the user's inventory
, "carried": [...] # items from other domains in the user's inventory
, "dropped": [...] # items the user has left in this domain, each with a "location"
, "prize": [...]   # items from other domains hosted here, each with "hidden"
}
````

**What to do:** The four lists are how you learn what items exist: an item from another domain is only ever described to you here.
Remember each item's `name`, `description`, and `verb` by its `id`.
Do not use the lists to decide where items are; ask the hub through [`/query`](#query).

The first time a user arrives, create their copy of your world:

1. Make a new copy of your game state for them, with the user in your starting location.
2. [`/transfer`](#transfer) each of your own items that stay home to where it starts.
3. Ask `/query` which open and which locked items you host, and `/transfer` each to the location you chose for that kind.

When a user arrives who has been here before, keep their state as they left it.

`"from"` says how they got here: `"login"`, the direction they journeyed in from, or `"direct"` if they journeyed by name.
You may use it to choose where they appear, or ignore it. Your whole domain must be reachable either way.

**Response:** status 200; the content is ignored.

### /depart

**Called by:** the hub, each time a user journeys out of your domain.

**Request:** `{"secret": ..., "user": ...}`

**What to do:** Keep the user's state, but remember that they are gone.
Until they `/arrive` again, respond to every `/command` from that user with status 409.

**Response:** status 200; the content is ignored.

### /dropped

**Called by:** the hub, each time a user drops an item in your domain. The hub handles `drop`; all it needs from you is where the user is.

**Request:** `{"secret": ..., "user": ..., "item": ...}`, where `item` includes its id, name, description, and verb.

**What to do:** Nothing but answer. Do not call `/transfer`: the hub moves the item to the location you return.

**Response:** the name of the user's current location, as plain text, not JSON.
For example, `return Response(text="classroom")`.

### /command

**Called by:** the web UI, each time a user in your domain types anything except `journey`, `drop`, `inventory`, `score`, or `region`.

**Request:** `{"user": ..., "command": [...]}`, where `command` is the list of words. See [Commands](#commands).

**Response:** plain text to show the user, not JSON.

- Respond with status 409 if the user has never arrived, or has departed and not come back.
- The text is displayed as HTML and line breaks are kept. Simple tags such as `<q>`, `<strong>`, and `<sub>` are fine; scripts or anything else that changes the page are not.
- A response that begins with `"$journey "` makes the web UI run the rest of it as if the user had typed it. For example, respond `"$journey east"` to `go east` at the east edge of your domain.

# Commands

## How the web UI cleans up what the user types

1. It makes the text lower-case, removes everything except letters, digits, hyphens, and spaces, and collapses repeated spaces.
    For example, "`Open  the door!`" becomes "`open the door`".
2. If the first word is the beginning of exactly one verb it knows, it expands it to that verb.
    The verbs it knows are go, north, south, east, west, look, take, use, open, close, tell, read, journey, region, inventory, and drop.
    For example, "`o door`" becomes "`open door`".
3. All articles (a, an, the) and prepositions are removed.
    The prepositions are: about, above, across, after, against, among, around, at, before, behind, below, beside, between, by, during, for, from, in, inside, into, near, of, off, on, out, over, through, to, toward, under, with, aboard, along, amid, as, beneath, beyond, but, concerning, considering, despite, except, following, like, minus, next, onto, opposite, outside, past, per, plus, regarding, round, save, since, than, till, underneath, unlike, until, upon, versus, via, within, without.
    For example, "`use the key in the lock of the door`" and "`use the key to lock the door`" both become "`use key lock door`".
4. A few phrasings are replaced with a standard form.
    For example, "`west`" becomes "`go west`" and "`take inventory`" becomes "`inventory`".
5. If the first word is `journey`, `drop`, `inventory`, `score`, or `region`, the command goes to the hub.
    Otherwise it goes to the domain the user is in.

Your `/command` receives the resulting list of words.
If the user types `Open the door`, you get `["open", "door"]`.

#### Note
You may invent verbs of your own, such as `push` or `eat`; anything the UI does not recognize is passed to your domain unchanged.
The words removed in step 3 never reach you, so do not name an item `round` or `plus`, and do not expect to tell `turn on lamp` apart from `turn off lamp`.

## Commands every domain must support

- `look`: Displays the description of the user's current location and every item that is there.
  That includes your own items, items you host for other domains, and anything the user dropped there.
  Get them all with one [`/query`](#query) for the user's location.

  When you mention an item, show its id, like this: `There is a paper <sub>17</sub> here.`
- `look` *item*: Displays the item's description if the user is carrying it or it is in the user's location.
- `take` *item*: If the item is in the user's location, moves it into the user's inventory.
- `go` *direction*: Moves the user in that direction, if your map allows it, and displays the new location and its items as `look` would.
  On a later visit to the same location you may show just its name.
- *verb* *item*: If the user is carrying the item and *verb* is in the item's `verb` map, displays that response.
  This must work for items from other domains too.

These are handled by the hub, but your domain must cooperate:

- `drop` *item*: The hub asks your [`/dropped`](#dropped) where the user is and puts the item there.
  The item must then show up in `look`, and `take` must work on it.
- `inventory`: Shows what the user is carrying.
- `journey` *direction*: Moves the user to another domain. You see a `/depart`, and later perhaps an `/arrive`.

Everything else is yours to design: `open door`, `use key cabinet`, `tell guard password`, and so on.
Check every command against where the user is and what they have:
`read sign` should only work where the sign is, and `use key cabinet` only if the user is at the cabinet and carrying the right key.

When you do not understand a command, say so in a sentence.
Never respond with an error status or a stack trace because the user typed something unexpected.

## Names and ids

1. Wherever you accept an item's name, also accept its id. `take 42` should take the item with id 42.
2. Accept a name when it is unambiguous. If two items with that name are in reach, ask the user to use the id.
3. When a puzzle needs one of *your* items, check for that item's id, not for any item with the same name. Another domain's `key` should not open your lock.
4. When the user tries an item that has the right name but is not yours, say so, such as `That doesn't fit this lock.`

# Tips

## Common mistakes

- **Keeping one copy of the game state.** Doors, switches, and the user's location must be stored per user. Test with two browser tabs.
- Not starting fresh in `/newhub`: When the hub is reset it registers your domain again, and the user ids start over from 0. Clear your users.
- **Testing an old version.** Restart `make start` after every change.
- **Returning the wrong format.** `/command` and `/dropped` return plain text. `/newhub` returns JSON.
- **Looking for hosted items by name.** `doodad` exists only on the practice hub. Place hosted items by the ids and `hidden` values the hub gives you.
- **Guarding a puzzle with a name.** Check for your own item's id. Any domain can define an item named `key`.
- **Crashing when the hub says no.** A `/transfer` can be refused. Check the status and tell the user something sensible.
- **Forgetting the words the UI removes.** `look in box` arrives as `["look", "box"]`.

## Organizing your code

 Organizing your code isn't graded, but it will make the rest of the project a lot easier. We recommend doing it early, before there's too much code to move around. Run `make grade` before and after to make sure you didn't break anything!

Organization Advice:

1. Store your world as data. Put all your locations in one dictionary with their descriptions and exits. Then adding a new room is just adding an entry. Things that change while someone plays (like where the user is or whether a door is open) still go in each user's state.
2. Write each general command once. `look`, `go`, and `take` work the same in every room, so each one can be a single function that reads your world data. For example, `go` checks the current room's exits and either moves the user or tells them they can't go that way.
3. Keep your puzzles separate. Something that only happens in one spot, like swiping a card at a reader, can be its own small function. 
4. Have `/command` pick the right function. Check for puzzles first so they can override a general command:

   ```
   if (location, words) is a puzzle action:
       run that puzzle's function
   else if the first word is a general command:
       run that command's function
   else:
       try the word as a verb on a carried item
   ```

Note - Players can type an item's id instead of its name (like `use 121 reader`), so turn ids into names before you match words.

## Provided code

The skeleton includes CORS middleware so the web UI can reach your domain. You do not need to change it.

## Optional flair

None of this is required or graded.

- **Secret areas.** A hidden part of your domain that normal play does not reveal, with clues or none at all.
  Keep it much smaller than the main domain, and do not host other domains' items in it.
  It may break the requirements about losing and outside knowledge; they still apply everywhere else.
  Reward finding it with an extra 0.001 of score per secret: a user who wins and finds one secret gets `/score` 1.001. The hub accepts up to 1.005.
- **Partial scores.** Send scores between 0 and 1 as the user progresses, in increasing order.
- **Items that change.** An item's name, description, and verbs are fixed when you register it, so changing an item is up to your domain. Two ways:
  - Keep the change in your own state: store something like "the lamp is lit" per user and check it before falling back to the registered description and verbs. Only your domain sees the change.
  - Swap one item for another: register both versions, such as an `egg` and a `chick`. When the egg hatches, `/transfer` the egg to a location your domain never shows, such as `"gone"`, and `/transfer` the chick to `"inventory"`. Every domain then sees the chick. You can only swap your own items, the new version must leave out `hidden`, and your domain must still be possible to finish without whatever was used up.
- **Arrival direction.** Use `/arrive`'s `"from"` to place users at the matching edge of your domain.
- **Short descriptions on return.** Show a location's full description on the first visit and just its name after that. Keep `look` showing the full description.
- **Synonyms and extra verbs.** Accept `examine` as well as `look`, or invent verbs that fit your theme, such as `push` or `climb`.

# Appendix: the example domain

The example domain is Siebel 1404 and its surroundings. It is the domain running on the demo server.

| Location | Exits | What is here | Hosts |
|---|---|---|---|
| foyer | north to classroom; east leaves the domain | a sign to read; a paper | |
| classroom | south to foyer; west to podium; east to closet | a door with a card reader | open items |
| closet | west to classroom | shelves of equipment | locked items |
| podium | east to classroom | a cabinet, a screen, a manual | |

| Item | `hidden` | Purpose |
|---|---|---|
| paper | left out | Starts in the foyer. Reading it reveals a password. `fold paper` turns it into the airplane. |
| airplane | left out | Not placed anywhere. Exists only when the paper is folded; `unfold airplane` turns it back. |
| manual | left out | Starts at the podium. Reading it gives a hint. |
| i-card | `"open"` | Found in another domain. Opens the closet door: `use i-card reader`. |
| key | `"locked"` | Found in another domain. Unlocks the podium cabinet: `use key cabinet`. |

The state it keeps for each user: the user's location, whether the closet door is locked, whether the cabinet is locked, closed, or open, whether the switch inside it is up, and whether the user has won.

To win, a user unlocks and opens the cabinet, flips the switch inside it to turn on the screen, and tells the screen the password from the paper.

How the example follows the hiding rules:

- **The classroom holds other domains' open items.** Anyone can walk into the classroom and take those items.
- **The closet holds other domains' locked items.** The closet door opens with the i-card, which is this domain's own *open* item. The hub hid the i-card in plain sight in another domain, so a player has to travel there, pick it up, and bring it back before they can open the closet.
- **The cabinet is part of winning, not a hosting spot.** A player must open it to reach the switch that turns on the screen, and it opens with the key, which is this domain's own *locked* item. Needing a locked item is fine here because nothing from another domain is inside the cabinet.

The rule is about what a place holds, not what kind of place it is.
A place that holds other domains' locked items, like the closet, must open with one of your open items. That is what keeps domains from locking each other out.
Everything else in your domain, like the cabinet, a side room, or the final puzzle, may need any of your items, including your locked ones.

Its walkthrough:

````
take paper
north
take doodad
journey east
use i-card on reader
east
take whatsit
west
west
use key on cabinet
open cabinet
use switch
tell screen xyzzy
````
