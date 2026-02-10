---
title: MP3
subtitle: PNG
author: Luther Tychonievich
---

# Overview

In this Mighty Project (MP), you will write code with less guidance than you likely had in the past.
In particular, you will

1. Write programs starting from nearly-empty files.
2. Implement functionality from definitions in official standards documents.
3. Use library functions we haven't taught, using the official manual pages to understand their operation.

The specific tasks of this MP involve working with PNG files, a common image file format.
PNG files, like many other file formats, are not text-based: unlike JSON, txt, or source code you cannot simply open them in a text editor to explore their contents. You will need to consult the PNG documentation to understand the meaning of the bytes in a PNG file.

## Understanding PNG

PNG is a chunk-based file format.
It is an open format, completely specified in a public royalty-free document, <https://www.w3.org/TR/png/>.
The goal of a specification like that is to leave no ambiguity in how to create a file or interpret one you receive, which can lead to them being rather dense and difficult to read.
Various parties sometimes make less-complete but easier-to-read summaries, which can be an easier place for someone new to the format to start.

We recommend using this resources <https://en.wikipedia.org/wiki/PNG> for this MP. We will not summarize or teach you this content directly.


### Background on Chunk-based Media Files
In 1985 Electronic Arts introduced a concept for storing media files as a sequence of packets or chunks of binary data, each preceded by a short label stating what type of data the chunk contained.
Their Interchange File Format was adopted with slight tweaks by Microsoft as the Resource Interchange File Format (RIFF) on top of which Windows 3.1's video, audio, and user interface element file formats were built.
Since then that model has come to dominate the media file formats: many formats have the general form of a sequence of chunks, each with a header that specifies its type and size, coupled with specific rules for interpreting the bytes of certain chunk types.

One benefit of a chunk-based design is that basic applications can skip chunks they don't understand and still get partial functionality.
Additionally, updates to the format can add new features in new chunk types without breaking any existing files or applications.

## Starting from Nothing
The initial files we provide have very little structure in them, not much more than picking out the command line arguments. A learning goal of this MP is for you to be able to take high-level text instructions, and documentation to create a finished program. We believe this is a valuable skill. 

### The two most common student questions

Question
:   How do I get started?

Answer
:   Think high level what you want the code to do, then break that into smaller steps and so forth. Eventually you will have small enough steps you can start turing them into C code. 


Question
:   I'm stuck, what do I do next?

Answer
:   Reflect back on the high level things you want your program to do, then see if your code is doing them. You can also walk through each line in the debugger, step by step. Check that the variable values after each line makes sense. See where it is in the file when it gets to the end of your code, then ask "what comes next?" and do that.

# Initial Files

[`mp3.zip`](../mp3.zip) contains header files, testers, and a Makefile.
You will edit the following files:

- `pngchunklist.c`
- `extractuiucchunk.c`
- `insertuiucchunk.c`
- `pnglib.c` and `pnglib.h` (optional, provided to allow sharing code between the other three files)

The first three of these will be seperate command-line applications;
we provide the basic command-line argument count checking for you and you write the rest.
The pnglib files will not be directly tested, but can be used to keep your code organized.

# Applications

## pngchunklist

This application lists the type and size of each chunk in the PNG file in the order that they appear in the file.
The format of this should be one printed-out line per chunk,
each with the type, a space, and the length.

You can implement it in whatever way you wish, provided that you write all the code yourself without copying from any AI system or third party.
We recommend using the following libraries:
    
- `fopen`
- `fseek`
- `fread`
- `ntohl`
- `printf` or an alternative display function. Remember that if you are printing a string it needs to be null-terminated; for example a 4-byte string is stored in 5 bytes, with the last one being 0.

Coding this application shouldn't require `malloc` and should `fseek` past most of the bytes in the file.

## extractuiucchunk

This application looks for a special chunk with type `uiuc`; if found, it copies the data inside that chunk into a separate file.
If there is more than one such chunk, it copies the first and then exits with code 0.
If there is no such chunk, prints an error message to stderr and exists with code 4.

You can implement it in whatever way you wish, provided that you write all the code yourself without copying from any AI system or third party.
We recommend sharing significant code from `pngchunklist` (ideally by putting the shared code in library functions in `pnglib.c` and `pnglib.h`),
and additionally using the following libraries:

- `memcmp`{.man3} (or `strncmp`{.man3} or the like)
- `fwrite`{.man3}
- `malloc`{.man3} and `free`{.man3} -- not strictly required, but several simple approaches to the task would need them.

## insertuiucchunk

This application makes a copy of a PNG file with a new `uiuc` chunk.
If the input PNG file already has a `uiuc` chunk, replace it.
If not, add it between two existing chunks.

You can implement it in whatever way you wish, provided that you write all the code yourself without copying from any AI system or third party.
We recommend sharing significant code with the other two applications (ideally by putting the shared code in library functions in `pnglib.c` and `pnglib.h`).

You'll also need to generate a crc32 checksum; this is a computation based in coding theory which most CS programs either don't teach at all or only teach it in an elective course.
Perhaps that is why the code you need is given in the PNG specification in [Appendix D](https://www.w3.org/TR/png/#D-CRCAppendix).
Note there are three functions in that appendix:
the first to be run just once,
the second to be given bytes of a chunk (either all at once or a few bytes at a time, it makes no difference),
and the third a reference showing how you'd use the second if you have the entire chunk in one array of unsigned characters.
Also note that the appendix is somewhat old and assumes that `long` means a 32-bit integer; currently `int` (or `int32_t` from `#include <stdint.h>`{.c}) is the type with that size.

# Share Your Image

Put a secret payload inside a PNG of your choice and share it [on the CampusWire post](https://campuswire.com/c/G0463FDE3/feed/40) and [its accompanying Drive folder](https://drive.google.com/drive/folders/10NjGG9nwkIqw6fJvel5BuWvHcimmoZ4o).
This is an opportunity to share a bit about yourself and your interests; please keep it (both the image and its hidden contents) inoffensive.

# Testing Your Program
Automated tests are provided in the `make test`{.sh} target.
These use specific images in the provided `img/` directory to run.

## Debugging failed tests
If you fail a test case, you should look inside `tests.py` and search for the message associated with the string,
then look for the command that was run to create that error message (which are strings that begin `./` and the name of one of your three programs) and try running that yourself.
Note that some tests depend on the outcome of previous instructions; for example, one of the commands (line 185) is

```sh
./extractuiucchunk tmp2 tmp4
```

where `tmp2` was previously created (on line 143) by

```sh
./insertuiucchunk img/onered.png tmp tmp2
```

and `tmp` was previously created (on line 140) by

```sh
echo "this is a test" >> tmp
```

Thus, to debug that case you'd need to run the `echo` and `./insertuiucchunk` tests first,
then run the extract test that failed in the debugger.

# Submission and Grading

Submit on the Prairie Learn (linked above).

Submit `pngchunklist.c`, `extractuiucchunk.c`, `insertuiucchunk.c`, `pnglib.c`, and `pnglib.h` (even if you didn't edit the last two).

