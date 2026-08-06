---
title: MP3.1
subtitle: UTF-8
author: Luther Tychonievich and Jule Legende
---

This is not the full Mighty Problem (MP). It is part 1 of 2 that will count as MP3. 

MP3 - The goal of MP3 as a whole (parts 1 and 2) is to give you practice and intuition around manipulating data on a bit level. Each part is meant to show you a different use case. 

For this part of MP3 you will be encoding and decoding UTF-8 characters.

If you get stuck try the following:
1. Read through these specifications and the starter code carefully. Feel free to add your own comments as you develop a plan. 

2. Once you have some code, use the debugger to step through each part slowly. Think critically about what you expect the code to do and then see if that is what is actually happening based on the debugger output. Feel free to add code and play around.

3. If you get stuck (30+ minutes of no progress), post on campuswire or come to office hours. This will take longer than getting the answer from AI but it has two benefits. 
    a. You will get a hint to get unstuck instead of just the answer. This will help you actually learn the skills you need.

    b. You will network with the professor, course staff, and other students. These connections will be vital in your schooling and career. It's also nice to connect with other humans! 

# Learning Goals
1. Understand the benefits of UTF-8 encoding and therein a benefit of working at the bit level. 
2. Understand and be able to work with a variable length encoding like UTF-8. 
3. Be able to use bit operations to store and retrieve small amounts of information.

# Background

## char versus character
In C, `char` means "1-byte integer." It was named after characters based on the 1-byte encodings that were used when C was invented for Latin-derived languages, but `char` and "character" are distinct concepts. 

A `char` can represent any information that can be represented with 1 byte. 

A character is an abstract entity like the "capital R" or "🧡."

## ASCII
ASCII maps values 0-128 to 128 characters. The values 0-128 are small enough to be stored in a `char`. 

## Unicode, and UTF-8
Unicode maps values 0-1,114,111 to 1,114,111 characters. In Unicode, these values are called code points. For example, the code point 129,505 maps to the 🧡 character. 129,505 is too big to be represented by 1-byte so we can't use a single `char`. Instead, when working with Unicode, we can use the UTF-8 encoding. This encoding translates a code point to a series of `char`s depending on how much space is needed. It is a variable length encoding which means different code points may use different amounts of `char`s (1-4). However, UTF-8 is a bit more complicated than just representing the code point across more bits.

So why use UTF-8 versus a simpler encoding?
- UTF-8 can encode the full Unicode range (over a million code points) rather than just the 128 code points that ASCII can encode. This now includes Greek, Arabic, emoji, mathematical symbols, and more!
- UTF-8 is backward compatible with ASCII. If a file uses ASCII it is already valid UTF-8 and doesn't need to be converted.
- UTF-8 is space efficient for low code points. UTF-8 uses a variable length encoding, which means common text uses only 1-2 bytes while large code points can use up to 4 bytes.
- UTF-8 is self-synchronizing. The header of each byte indicates where in a series of UTF-8 encoded bytes it belongs. This makes it easy for the computer to find the start and end of a character.
- UTF-8's byte sequence is independent of the machine architecture (always big endian). This means a UTF-8 encoded file looks and means the same everywhere. 

** Please see the relevant text chapter and lecture on UTF-8 for more details on the specifics of encoding the decoding code points to UTF-8. **

# Task 1 - Decode
`int decodeCharacter(const char **utf8)` will decode one character from the string (passed in as `utf8`) to its corresponding code point and return it as an int. Before returning, the function will move the pointer (`utf8`) to the start of the next UTF-8 character. Repeated calls will read all code points in a string. More details can be found in the starter code header file.

# Task 2 - Encode
- `int encodeCharacter(char **utf8, size_t *space, int codepoint)` writes one code point encoded into UTF-8 into an array (`utf8`), moving the pointer past it and updating the remaining space. Repeated calls will fill an entire string with UTF-8 characters. More details can be found in the starter code header file.

# Task 3 - Length
These last two functions can be fairly simple, especially if you use `decodeCharacter` to implement one of them:

- `size_t strlen8c(const char *s)` is like `strlen` but returns a count of characters, not `char`s.

- `size_t strlen8i(const int *s)` returns how many bytes would be needed to encode the given code points in UTF-8.

# Important Notes
In C, `char` has an implementation-defined signedness. That means on one computer a `char` assigned the value `0x9A` has the value 154, while on another it has the value −102, making comparisons complicated. If your code needs to compare `char` values or store them in a larger type such as an `int`, you should manually cast them to either `signed char` or `unsigned char` first.

It is likely that your computer and the testing computer disagree on the signedness of `char`. If your code works for you but not when submitted, double-check that you're never comparing plain `char`s, only `signed char`s or `unsigned char`s. If your code handles `char` signedness correctly, you should be able to add either `-fsigned-char` or `-funsigned-char` to the `CFLAGS` line of the `Makefile` without changing which tests pass.

# Logistics 

## Starter Code

[`mp3.1.zip`](../mp3.1.zip) contains header files, testers, and a Makefile.
You will add to `utf8lib.c` (and only that file).

`utf8lib.h` documents the functions you should add to `utf8lib.c`.
We recommend first copying each function declaration to `utf8lib.c` with a minimal function body (such as `return 0;`) so that the code will compile and run, failing all tests.
Then start implementing the functions one at a time.

The starter file does not include `stdio.h`, and you should not add it. In fact, you should not add any additional include statements. Do not use any printing functions (such as `printf`) in your code or even in a comment. This will be checked by `make test`, the command used to grade your code.

## Running the code 
To see your score locally run `make test`. This will run the full test suite that is also run on the autograder. 

## Debugging

It can help to run the tester directly by first running `make` and then `./tester`, and to run it in valgrind using:

```sh
make
valgrind --trace-children=yes --leak-check=full ./tester
```

# Submission and Grading
The test suite runs tests worth 69 point. Valgrind will also be run and worth 10 points on the autograder.

To receive a grade, please submit on Prairie Learn (linked above). Remove any printouts from your code before submitting (including removing the `#include <stdio.h>` line explicitly and removing any commented out print statements).

## AI Policy
To get the most out of this MP and to avoid an academic integrity violation follow these rules for this MP.

1. Do not feed AI/Search Engines any of the given code or specific functions. For example, do not look up: "How would I write the C code to decode a UTF-8 character." or "Implement int decodeCharacter(const char **utf8)."

2. Do not feed AI/Search Engines any specific bit operations or questions. For example, do not look up "How do I use bit operations to get from the value 129,505 to UTF-8 encoded char's". Part of the MP is figuring this out! 

3. You may use AI/Search Engines to get practice with related content. For example, you can look up "Help me get practice with bit shifting to the left. Can you show me a few examples and walk through them with me step by step?" The key is not to put anything specific to the MP into the AI/Search Engine.

4. You may use AI/Search Engines to figure out errors by looking up the error produced, not feeding it all your code and asking what is wrong.

5. Office hours are always open to any questions!

** If you aren't sure what is allowed, feel free to ask on campus wire or office hours. **