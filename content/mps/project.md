---
title: Final Project
subtitle: Distributed Tetris
author: Luther Tychonievich
---

# Tetris AI: Bots v Humans

Flatris is a variant of Tetris where two players play against one another. Each has their own Tetris board, with all the regular Tetris rules, with one exception: if your opponent clears a row it doesn’t just vanish: it has one random cell cleared and then is added to the bottom of your board. Instead of points for speed, number of cleared rows, etc, this is a Boolean-score game: you win if your opponent loses.

Course staff will provide a working Flatris server. You will provide a bot, a game AI that plays on this server. Your goals is to make your bot indistinguishable from a human player. That will definitely need to include pauses between actions: humans can’t press keys anywhere near as fast as bots can.

You have two programming tasks:

1. [Modify MP10 to support passive observers](#modify-mp10-to-support-passive-observers)
2. [Write a Tetris Bot](#write-a-tetris-bot)


# Initial Files

Initial files are available in [project.zip](project.zip), including one file you'll edit: `bot.py`.
You will also need a copy of your [MP10](mp10.html) solution, and will further edit `tetris.py`.

You may change any of the provided files freely and may include other .py files in your solution if you wish.
The comments in the provided `bot.py` file indicate where we expect most students will want to work.

The provided Makefile has five targets:

- `make bot` runs `bot.py` in dev mode, showing errors and informational messages to the terminal.
- `make tetris` runs `tetris.py` in dev mode, showing errors and informational messages to the terminal.
- `make both` runs both `bot.py` and `tetris.py` in dev mode, showing errors and informational messages from both to the same terminal. This can be handy for quick tests, but debugging might go better having `make bot` and `make tetris` in separate terminals so you can tell which messages are from which.
- `make background` runs `bot.py` in the background; it will keep running even after you close the terminal. This is intended for the May 12 checkoff, not for development and debugging.
- `make stop` will stop the background run (and any other ongoing python instances).

If you wish to use the provided `submitcode.py` and have files other than `tetris.py` and `bot.py` that your code uses, edit the space-separated list of files on the third line of that file to submit them all.

# Modify MP10 to support passive observers

[MP10](mp10.html) creates a new game for each connecting [WebSocket](../text/ws.html).
To build a game-playing program you're going to want to be able to watch the bot play.
To achieve this watching ability, you'll need to add a bit of code to your MP10.

## Watching specification

The basic idea is to have two kinds of WebSockets:

1. Game-playing WebSockets, connected to `/ws`, created by browsers with `index.html` and by your bots.
2. Game-watching WebSockets, connected to `/snoop`, created by the `watch.html` distributed with this project.

You'll store a mapping between game-playing WebSockets and the game-watching WebSockets that are watching them.
Any message you send to a game-playing WebSocket you also send to each game-watching WebSocket that is watching that game.

Instead of responding to left/right/etc, game-watching WebSockets accept two messages:

The string `"?"`
:   Prompts the game server to send a message to the watcher formatted like `{"alive":[`...`]}`, where the "..." is replaced by a list of all active game IDs.
    
    The provided starter code for MP10 used `id(ws)`{.py}, where `ws` is the game-playing WebSocket, to identify WebSockets in `allws`; our `chat1.py` in-class example used a global counter to assign IDs.
It does not matter what format you pick: whatever you send here will be echoed back to pick what to view.

An ID previously returned in response to `"?"`
:   Asks that future messages to the identified game-playing WebSocket also be forwarded to the game-watching WebSocket that sent this request.

We won't grade this change on correctness; if it has small errors that don't prevent it being used to watch your bot at work that's fine.

## Tips on how to implement watching 

There are multiple ways to get watching to work.
One possible avenue is outlined below.

1. Refactor^[To "refactor" is to change the code without changing resulting behavior. Refactors can be easily tested by running the program before and after the change and verifying that it runs the same.] your code to rename `allws` as `playws`.

2. Add a GET endpoint that returns the provided `watch.html`. This may be modeled after the existing `/` endpoint code. Verify that when you visit your new endpoint you see the watching page (which will not yet work).

3. Add a GET endpoint `/snoop` that upgrades its request to a WebSocket. This may be modeled after the existing `/ws` endpoint code.
    
    Add the WebSocket to a new `watchws` global that mirrors `playws`, and remove it before retuning.
    
    In `shutdown_ws`, shut down all WebSockets in `watchws` as well as those in `playws`.

4. In `/snoop`, when a TEXT message's data is `?`, send a JSON object with key `alive` and value being a list of all the keys in `playws`.

5. Create a global mapping indicating which playing WebSockets are being watched by which watching WebSockets.
    This is initially empty.

5. In `/snoop`, when a TEXT message's data is (a textual representation of) the identifier of something in `playws` both (a) remove any previous mapping between a playing WebSocket and the watching WebSocket and (b) add a mapping to the playing WebSocket with that ID.
    When removing the WebSocket from `watchws`, also remove it from the mapping of watchers.

6. Refactor your code so that instead of calling `send_json` directly, you instead call a new function you write that calls `send_json`.

7. In the new function that calls `send_json`, loop through any watchers of the recipient WebSocket and send the same message to each of them.

# Write a Tetris Bot

The starter code in `bot.py` implements a particularly poor tetris bot.
You can try it as follows:

1. In one terminal, run your [modified](#modify-mp10-to-support-passive-observers) `tetris.py`
2. In another terminal, run `bot.py`
3. In one browser tab, open the bot.py URL (likely port 41801) and give it the `/ws` path of your tetris URL
4. In another browser tab, open the tetris.py URL (likely port 10418) with your newly-added watching path

You should then see this bot, which just waits a bit and then drops each Tetronimo.
When the game ends you won't see anything more happen until either (a) you refresh the watcher page or (b) your tetris code allocates a new game with an old ID.

You should modify this code as follows:

1. Add a reasonably-competent Tetris playing algorithm.
    
    Your bot must be at least as good at Tetris as the following bot:

    <div class="example">

    Starter Bot
    
    When you get a message with `next` in it (i.e. a new tetromino is on the board), pick a full sequence of moves as follows:
    
    1. Use your MP10 logic to lop through all possible horizontal positions and orientations of the new tetromino, finding where it would drop from each position.
    2. Evaluate those options based on a heuristic to find the "best"; as a starter the "best" option maximizes the sum of the *y* coordinates of the cells in the tetromino.
    3. Emit `left`, `right`, `cw`, and/or `ccw` commands to get the tetromino into that horizontal location and orientation, followed by `drop`.

    </div>
    
    We hope your bot is much better than the starter bot (likely by using a better heuristic), but doing at least this good is expected.
    
    The most common measure of the goodness of a Tetris bot algorithm is the number of rows it can clear before it loses.
    The algorithm outlined above tends to clear between 1 and 5 rows.
    Clearing 20 is needed to send more rows to your opponent in Flatris than you keep yourself.

2. Add delays (and possibly mistakes) to make your bot seem human.
    
    We'll be running a Turing test as part of the final project check-off.
    Bots that play so fast you know they have to be a bot will not get points.
    Bots that play in a way that convinces other students it is a human instead will get prizes.

3. Prepare for Flatris

    Flatris will mostly seem like Tetris to your bot, with the following exceptions:
    
    - There will be several types of `"event"`s: you might win, or lose, or have your opponent disconnect.
        You can treat these all the same: the game is over.
    
    - Sometimes 1--4 new rows will be added at the bottom of the board, with everything above them moved up.
        This will arrive like any other `"board"`, but is created by the other player clearing rows instead of anything you did.
    
    - Some messages will be JSON objects with none of the keys defined in MP10^[We haven't finalized the format of these messages, but they might be things like `{"wait":0.3}`{.json} or `{"other":{"board":[...]}}`{.json}].
        You can safely ignore these.
        They are indicating what the oponents board looks like,
        informing the web UI of wait times, and other bot-irrelevant information.

    - Flatris will have a gap between the WebSocket connecting and the game beginning.
        Messages sent by a bot (or human) before the game server sends its first message with `live` in it will be ignored by the game server.

<details class="aside"><summary>Published Tetris Heuristics</summary>

There have been *many* publications about Tetris AIs.
The following are a few that I think you might find contain implementable ideas.

- [Sibert, Gray, and Lindstedt 2015](https://escholarship.org/content/qt01w2w060/qt01w2w060_noSplash_92f7a5f2c8c7ce2415f7acb413d33d51.pdf)
  explores human performance against an AI model.
- [Böhem, Kókai, and Mandl 2005](https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=b0fe1ed14404db2eb1db6a777961440723d6e06f) list 12 heuristics and a learning approach to picking how to combine them.
- [Thiery and Scherrer 2009](https://inria.hal.science/inria-00418954/document) contains a table of 32 heuristics and describes how to combine six of them to implement Dallacherie's unpublished but very effective approach from 2003.
- [Bergmark 2015](https://kth.diva-portal.org/smash/get/diva2:815662/FULLTEXT01.pdf) describe a heuristic based on identifying three types of "holes" in detail, with suggestions on how to score and pick moves.

</details>


# Check-off and Grading

## Before class on May 12

1. Turn on your VM
2. Ensure your latest code is on your VM
3. Ensure your latest code has been submitted
4. Run `make background`
5. Log out of your VM
6. Verify that your VM's bot interface page still shows

:::aside
Some students have found that `make background` is not sufficient to keep their code running after they log out.
This may be caused by a system setting, which can be modified to allow programs to run after you log out by running

```sh
loginctl enable-linger $(id -u $USER)
```

This should only be needed once: it permanently changes part of the VM setup.
:::

## In class on May 12


All grading occurs based on detailed logs of what each bot and human does during the in-class checkoff on May 12^th^ at 1:30pm.
The following are required for full credit:

1. Your bot connects to our servers and plays Tetris.
2. Your bot does not play faster than a human can.^[Because we will have both human and bot logs, if your bot sends keys faster than the fastest human, we will judge it to be "too fast".]
3. Your bot plays at least as well as the starter bot listed above (i.e. can beat our reference implementation of that algorithm at least half the time).
4. The code you have submitted by the end of class matches what your bot does.
5. You connect to our servers and play Tetris.
6. You attempt to identify which players are human and which are bots.
7. You don't cheat during the graded part.
    
    Cheating includes things like bots taking human input, humans taking bot input, creating custom WebSocket or HTTP messages in an effort to bypass the game logic or interrupt others games, etc.

After the main game play for grading we will dismiss students who are satisfied with how things went and run another set of games where cheating *is* permitted. These cheating-allowed games are just for fun and won't be included in grading.

 

<!--

# Picking a final project 

The topic of the final project will be selected as an in-class activity on March 27^th^.
Goals of this project include:

- Implement a basic **distributed system**, in particular with multiple computers working together to provide a shared result.
- Each student implements a **web service** (using `aiohttp`) that does the distributed work.
- Create an **interactive application** where multiple users can interact with the application at the same time, using a web interface created by course staff.

Constraints on this project include:

- Novelty. We want a new project each semester.
- Scope. We want the project code to be around 2× as complex as other web-based MPs.
- Isolation. If one student's code crashes, that should not crash other students' code.
- Appeal. We'd like most students to like the idea of the project, and none to be offended by it.

-->
