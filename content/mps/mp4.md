---
title: MP4
subtitle: UTF-8
author: Luther Tychonievich
---

# Overview

In this Maddening Puzzle (MP), you will work with strings in C. While there are other character encodings, most strings today are stored in UTF-8. Working with UTF-8 will allow you practice with C-style strings (`char *`), sub-byte encodings, array-style memory management, and basic file I/O. All of these will help you build a deeper mental model of how data is stored and interpreted on a computer. 

# Initial Files

[`mp4.zip`](../mp4.zip) contains header files, testers, and a Makefile.
You will add to `utf8lib.c` (and only that file).

`utf8lib.h` documents the functions you should add to `utf8lib.c`.
We recommend first copying each function declaration to `utf8lib.c` with a minimal function body (such as `return 0;`) so that the code will compile and run, failing all tests.
Then start implementing the functions one at a time.

The starter file does not include `stdio.h`, and you should not add it.
Do not use any printing functions (such as `printf`) in your code.
That lack of printing will be checked by `make test`, the command used to grade your code.

# UTF-8 Handling

Write functions that treat a `char *` as if it were a string of characters.

In C, `char` means "1-byte integer." It was named after characters based on the 1-byte encodings that were used when C was invented for Latin-derived languages, but `char` and "character" are distinct concepts.

In Unicode, a **character** is an abstract entity like "capital R with acute accent" or "orange heart." Unicode gives each character a number between 0 and 1,114,111 called its **code point**, such as 340 for capital R with acute accent (Ŕ) or 129,505 for orange heart (🧡). UTF-8 encodes numbers as bytes, with small numbers using fewer bytes than big numbers, using up to 4 bytes for the highest code points. Thus 1 character is encoded in UTF-8 using 1, 2, 3, or 4 `char`s.

Two UTF-8-handling functions require non-trivial coding to handle UTF-8's various cases:

- `int decodeCharacter(const char **utf8)` reads one code point from a UTF-8-encoded string, moving the pointer past it. Repeated calls will read all code points in a string.

- `int encodeCharacter(char **utf8, size_t *space, int codepoint)` writes one code point encoded into UTF-8 into an array, moving the pointer past it and updating the remaining space. Repeated calls will fill an entire string with UTF-8 characters.

Two other functions can be fairly simple, especially if you use `decodeCharacter` to implement one of them:

- `size_t strlen8c(const char *s)` is like `strlen` but returns a count of characters, not `char`s.

- `size_t strlen8i(const int *s)` returns how many bytes would be needed to encode the given code points in UTF-8.

Note that in C, `char` has an implementation-defined signedness. That means on one computer a `char` assigned the value `0x9A` has the value +154, while on another it has the value −102, making comparisons complicated. If your code needs to compare `char` values or store them in a larger type such as an `int`, you should manually cast them to either `signed char` or `unsigned char` first.

It is likely that your computer and the testing computer disagree on the signedness of `char`. If your code works for you but not when submitted, double-check that you're never comparing plain `char`s, only `signed char`s or `unsigned char`s. If your code handles `char` signedness correctly, you should be able to add either `-fsigned-char` or `-funsigned-char` to the `CFLAGS` line of the `Makefile` without changing which tests pass.

# String Replacements

Write a structure and functions that support find-and-replace in a string.
Because of how UTF-8 is designed, if you write these thinking only about `char`s they will also work with UTF-8 characters.

A string replacement replaces one substring with another substring. A string replacement set holds multiple such replacements and could be used, for example, to remove emoji (e.g. replace `"🍞"` with `"bread"`) or create rebuses (e.g. replace `"hear"` with `"🩷 − 🍵"`).

For full credit, use an algorithm that is O(n) in the length of the input string. If several replacements are possible, resolve them using the following rules:

- If two replacement options do not overlap, apply them both.
- If two replacement options do overlap, apply the one that starts earlier in the string. If they start at the same position, apply the longer one.
- Only match text in the initial string against replacement options, not the outputs of prior replacements.

For example, given these replacements:

| Old | New |
|:---:|:---:|
| `"34"` | `"㉞"` |
| `"340"` | `"☺"` |
| `"4000"` | `"𐄥"` |

The string `"34000"` would become `"☺00"`: that's an earlier match than `"3𐄥"` and the same earliness but a longer match than `"㉞000"`.

Your code will need to handle multiple distinct replacement sets. To support that, you'll define a replacement set structure:

- `typedef struct _replacement_set_t ReplacementSet;` in the `.h` file says "there will be some structure defined in a `.c` file; we're going to call it a `ReplacementSet` here." In the `.c` file define it as `struct _replacement_set_t { /*...*/ };`. We do not specify which data structure to use; after CS 225 you have several options (hash table, tree map, parallel arrays, list of pairs, trie, etc.) and we leave the choice to you.

Because your replacement sets may need to allocate heap memory, you'll implement two memory-management functions:

- `ReplacementSet *newReplacementSet()` to allocate a new `ReplacementSet`; this function should call `malloc`.

- `void deleteReplacementSet(ReplacementSet *set)` to deallocate an existing `ReplacementSet`; this function should call `free`.

The work of string replacement is done in two functions:

- `void addReplacement(ReplacementSet *set, const char *from, const char *to)` adds a replacement to the set. You may store `from` and `to` directly, but will likely need to allocate memory to hold those pointers.

- `char *replaceAll(ReplacementSet *set, const char *input)` allocates a new `char` array (using `malloc`) and applies all replacement options while copying `input` into it.

# Debugging

It can help to run the tester directly by first running `make` and then `./tester`, and to run it in valgrind using:

```sh
make
valgrind --trace-children=yes --leak-check=full ./tester
```

# Submission and Grading
To see your score locally run `make test`. This will run the full test suite that is also run on the autograder. 

The test suite runs tests worth 100 points: 70 for UTF processing, 20 for substring replacement functionality, and 10 for substring replacement efficiency. Valgrind will also be run and worth 30 points on the autograder.

To recieve a grade, please submit on Prairie Learn (linked above). Remove any printouts from your code before submitting (including removing the `#include <stdio.h>` line explicitly).