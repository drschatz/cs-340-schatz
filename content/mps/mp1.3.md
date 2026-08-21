---
title: MP1.3
subtitle: Linked List in C
author: Luther Tychonievich and Jule Schatz
---

This is not the full Machine Project (MP). It is part 3 of 3 that will count as MP1. 

MP1 - The goal of MP1 as a whole (parts 1, 2, and 3) is to give you indepth practice with C, VS Code, and problem solving. These are vital skills for the rest of the course (MPs, HWs, and Exams). Each part has a slightly different approach to give you a variety of practice. 

This MP part requires you to write a doubly linked list in C for both a char and a c-string. You will have the required knowledge to start this MP after the second "C not C++" lecture.

This MP is intended to help you understand C so that later MPs will be easier to do. If you have someone or something else do the MP for you, that learning won't happen and you'll find later MPs much harder as a consequence.

If you get stuck try the following:
1. Read through the code and comments carefully. Feel free to add more comments as you figure things out.  

2. Run the code with the debugger and step through each part slowly. Think critically what you expect the code to do and then see if that is what is actually happening based on the debugger output. Feel free to add code and play around.

3. If you get stuck (30+ minutes of no progress), post on campuswire or come to office hours. This will take longer than getting the answer from AI but it has two benefits. 

    a. You will get a hint to get unstuck instead of just the answer. This will help you actually learn the skills you need.

    b. You will network with the professor, course staff, and other students. These connections will be vital in your schooling and career. It's also nice to connect with other humans! 

# Learning Goals
1. Be able to work with dynamic memory, structs, multiple files, and c-strings in C. 
2. Be able to solve coding problems by writing code from scratch.

# Task 1 - Implement a linked list

Implement a C version of a doubly linked list for a list of `char`s and a list of c-strings.

## C you will need

You'll probably want to use `free`, and either `malloc` or `calloc`. Other functions defined in `string.h`, like `strcmp` and `memset`, are also permitted. The tests will verify that those are the only library functions that you use.

You'll be required to meet all the rules of C. This will be enforced by compiling with the following compiler flags (included in the makefile):

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

# Logistics

## Starter Code

`mp1.3.zip` contains all starter files needed and the corresponding tests. Download it from [`mp1.3.zip`](../mp1.3.zip) and unzip it on your computer into the `cs340` directory you created during the environment setup.

The provided `dll.c` **does not compile** because it does not define the functions required by `dll.h`. 

Our first recommendation is to add enough that it does compile (stub out the functions). That means either adding an empty body or a single return statement. 

`dll.c` does not include `stdio.h`, and you should not add it. Do not use any printing functions (such as `printf`) in your code. Instead, we recommend using the debugger. That lack of printing will be checked by `make test`, the command used to grade your code.

For help writing C code, see relevant lectures and readings from the Content page on this website.

## Running the code 
This MP does come with a makefile and tests ready to go.  
- Compile with `make`
- Run tests with `make test`
- Run for more test details `./dll_c`

# Submitting and Grading
Submit on the Prairie Learn. Only submit `dll.c`; do not modify any other file. This MP part does have public tests and the Prairie Learn autograder will show you your projected score. 

If you submit within 24 hours after the deadline you will recieve only up to 90% credit for the MP.

## AI Policy
To get the most out of this MP and to avoid an academic integrity violation follow these rules for this MP.

1. Do not feed AI/Search Engines any of the given code or specific functions. For example, do not look up: "How do you implement a doubly linked list function called void dllDetachc(dllNodec *self);"

2. You may use AI/Search Engines to look up specific syntax. For example, you can look up: "How do I create a struct in C? How would I use that struct? Can you show me an example?" 

3. You may use AI/Search Engines to figure out errors by looking up the error produced, not feeding it all your code and asking what is wrong.

4. Office hours are always open to any questions!

** If you aren't sure what is allowed, feel free to ask on campus wire or office hours. **