---
title: MP2
subtitle: PNG
author: Luther Tychonievich
---

In this Machine Problem (MP), you will create three seperate programs to work with and hide secrets in PNGs. 

The specific tasks of this MP involve working with PNG files, a common image file format.
PNG files, like many other file formats, are not text-based: unlike JSON, txt, or source code you cannot simply open them in a text editor to explore their contents. You will need to consult the PNG documentation to understand the meaning of the bytes in a PNG file.

If you get stuck try the following:
1. Write out, with comments, what you want your code to do. Expand each comment until they are small enough to be accomplished with a few lines of code.

2. Run the code with the debugger and step through each part slowly. Think critically what you expect the code to do and then see if that is what is actually happening based on the debugger output.

3. If you get stuck (30+ minutes of no progress), post on campuswire or come to office hours. This will take longer than getting the answer from AI but it has two benefits. 

    a. You will get a hint to get unstuck instead of just the answer. This will help you actually learn the skills you need.

    b. You will network with the professor, course staff, and other students. These connections will be vital in your schooling and career. It's also nice to connect with other humans! 

# Learning Goals
1. Be able to read and use documentation on a file format.
2. Be able to open, read, and traverse files on the byte level using fopen(), fseek(), and fread().
3. Be able to solve complex coding problems by writing code from scratch.

# Background
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

One benefit of a chunk-based design is that basic applications can skip chunks they don't understand and still get partial functionality.Additionally, updates to the format can add new features in new chunk types without breaking any existing files or applications.

## Starting from Nothing
The initial files I provide have very little structure in them, not much more than picking out the command line arguments. A learning goal of this MP is for you to be able to take high-level text instructions, and documentation to create a finished program. We believe this is a valuable skill. 

# Task 1 - pngchunklist
This application should list the type and size of each chunk in the PNG file in the order that they appear in the file. The format of this should be one printed-out line per chunk, each with the type, a space, and the length.

You can implement it in whatever way you wish, provided that you write all the code yourself without copying from any AI system or third party.
We recommend using the following libraries:
- `fopen`
- `fseek`
- `fread`
- `ntohl`
- `printf` or an alternative display function. Remember that if you are printing a string it needs to be null-terminated; for example a 4-byte string is stored in 5 bytes, with the last character being 0.

Coding this application shouldn't require `malloc` and should `fseek` past most of the bytes in the file

# Task 2 - extractuiucchunk
This application should look for a special chunk with type `uiuc`; if found, it copies the data inside that chunk into a separate file.
If there is more than one such chunk, it copies the first and then exits with code 0.
If there is no such chunk, prints an error message to stderr and exits with code 4.

You can implement it in whatever way you wish, provided that you write all the code yourself without copying from any AI system or third party.

We recommend sharing significant code from `pngchunklist` (ideally by putting the shared code in library functions in `pnglib.c` and `pnglib.h`), and additionally using the following libraries:
- `memcmp` (or `strncmp` or the like)
- `fwrite`
- `malloc` and `free` -- not strictly required, but several simple approaches to the task would need them.

# Task 3 - insertuiucchunk
This application should make a copy of a PNG file with a new `uiuc` chunk.
If the input PNG file already has a `uiuc` chunk, replace it.
If not, add it between two existing chunks.

You can implement it in whatever way you wish, provided that you write all the code yourself without copying from any AI system or third party. We recommend sharing significant code with the other two applications (ideally by putting the shared code in library functions in `pnglib.c` and `pnglib.h`).

You'll also need to generate a crc32 checksum; this is a computation based in coding theory. The idea behind the checksum is to detect accidental corruption of the data. The theory behind the checksum is not important for this class and you may use the code given in the PNG specification in [Appendix D](https://www.w3.org/TR/png/#D-CRCAppendix).

Note there are three functions in that appendix: the first to be run just once, the second to be given bytes of a chunk (either all at once or a few bytes at a time, it makes no difference), and the third a reference showing how you'd use the second if you have the entire chunk in one array of unsigned characters. Also note that the appendix is somewhat old and assumes that `unsigned long` means a 32-bit integer; currently `unsigned int` is the type with that size.

# Logisitics

## Starter Code

[`mp2.zip`](../mp2.zip) contains header files, testers, and a Makefile.
You will edit the following files:

- `pngchunklist.c`
- `extractuiucchunk.c`
- `insertuiucchunk.c`
- `pnglib.c` and `pnglib.h` (provided to allow sharing code between the other three files, you need to turn them in but they may be blank if you wish.)

The first three of these will be seperate command-line applications; we provide the basic command-line argument count checking for you and you write the rest. The pnglib files will not be directly tested, but can be used to keep your code organized.

## Share Your Image
Put a secret inside a PNG of your choice and share it [on the CampusWire post]() and [its accompanying Drive folder](https://drive.google.com/drive/folders/1xNXWrKwDgZfXNd5M0dOrqrt1f04AwkQJ?usp=sharing).
This is an opportunity to share a bit about yourself and your interests; please keep it (both the image and its hidden contents) inoffensive.

## Running the code 
Automated tests are provided in the `make test` target.
These use specific images in the provided `img/` directory to run.

## Debugging failed tests
If you fail a test case, you should look inside `tests.py` and search for the message associated with the string, then look for the command that was run to create that error message (which are strings that begin `./` and the name of one of your three programs) and try running that yourself.
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

Submit on the Prairie Learn. Submit `pngchunklist.c`, `extractuiucchunk.c`, `insertuiucchunk.c`, `pnglib.c`, and `pnglib.h` (even if you didn't edit the last two).

If you submit within 24 hours after the deadline you will recieve only up to 90% credit for the MP.

## AI Policy
To get the most out of this MP and to avoid an academic integrity violation follow these rules for this MP.

1. Do not feed AI/Search Engines any of the given code or specific functions. For example, do not look up: "How would I write the C code to insert a new chunk into a PNG."

2. Do not rely on AI/Search Engines for information on the PNG format. A learning goal of this MP is to get practice reading documentation. Often, it is not wise to rely on AI for important information as it can get things wrong. Therefore, it is important you have the skills to read sources yourself.

3. You may use AI/Search Engines to figure out errors by looking up the error produced, not feeding it all your code and asking what is wrong.

4. Office hours are always open to any questions!

** If you aren't sure what is allowed, feel free to ask on campus wire or office hours. **