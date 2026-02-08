---
title: MP2
subtitle: Linked List in C
author: Luther Tychonievich and Jule Schatz
---

This Micro Problem (MP) is **easier** than other MPs.
Don't plan your time on other MPs based on this one.

We give you a C header file and driver program for a C version of a doubly-linked list. Your task is to write the corresponding doubly-linked list C source file.

**Don't use AI**

AI systems can do this assignment without any trouble. So can our TAs, others who took this course before, and many other people.

This MP is intended to help you understand C so that later MPs will be easier to do. If you have someone or something else do the MP for you, that learning won't happen and you'll find later MPs much harder as a consequence.

If you get stuck try the following:
1. Use the debugger to step through each function line-by-line
2. Reread the code line by line, potentially drawing diagrams. 
3. After 30 minutes of not making any progress:
    - (a) Go to office hours.
    - (b) Post on Campuswire.
    - (c) Reach out to others in the class for advice (not answers).

# Initial Files

`mp2.zip` contains all starter files needed and the corresponding tests. Download it from [`mp2.zip`](../mp2.zip) and unzip it on your computer into the `cs340` directory you created during the environment setup.

The provided `dll.c` **does not compile** because it does not define the functions required by `dll.h`. 

Our first recommendation is to add enough that it does compile (stub out the functions). That means either adding an empty body or a single return statement. 

`dll.c` does not include `stdio.h`, and you should not add it. Do not use any printing functions (such as `printf`) in your code. Instead, we recommend using the debugger. That lack of printing will be checked by `make test`, the command used to grade your code.

# Machine Problem

Implement a C version of a doubly linked list for a list of `char`s and a list of c-strings or `char *`s.

## C you will need

You'll probably want to use `free`, and either `malloc` or `calloc`. Other functions defined in `string.h`, like `strcmp` and `memset`, are also permitted. The tests will verify that those are the only library functions that you use.

You'll be required to meet all the rules of C. This will be enforced by compiling with the following compiler flags:

**-Wall**
:   Enable all the warnings, even those that programmers often ignore.

**-Werror**
:   Makes warnings into errors, refusing to compile if there are warnings.

**-pedantic-errors**
:   Emit errors for things that the standard specifies but the compiler knows how to ignore.

**-std=c17**
:   Uses the official 2017 standard version of C, the last version to be widely supported by compilers.

You must not have any memory errors or leaks. This will be enforced in part using valgrind with a command like the following:

```sh
valgrind --leak-check=full --show-leak-kinds=all ./dll_c
```

must end with an "ERROR SUMMARY" reporting "0 errors" and no other error messages. Run the above command yourself to see specific valgrind information.

### For help writing C code, see relevant lectures and readings from the Content page linked above. ###

# Testing Your Program

- Compile with `make`
- Run tests with `make test`

# Submission and Grading

Submit on the Prairie Learn (linked above). Only submit `dll.c`; do not modify any other file.

