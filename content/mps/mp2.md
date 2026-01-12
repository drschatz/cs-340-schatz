---
title: MP2
subtitle: Linked List in C
author: Luther Tychonievich
---

This Mighty Problem (MP) is **easier** than other MPs.
Don't plan your time on other MPs based on this one.

This MP has only one goal: to help you understand how C is unlike C++.

We give you a C++ reference implementation of a doubly-linked list, with a simple driver program.
We also give you a C header file and driver program for a C version of the doubly-linked list.
Your task is to write the corresponding doubly-linked list C source file.
This will mostly consist of copying C++ code to the C file, then changing the C++-specific parts to be C-specific instead.

**Don't use AI**

AI systems can do this assignment without any trouble. So can our TAs, others who took this course before, and many other people.

Don't ask them to. Do this assignment yourself.

This MP is primarily intended to help you understand C so that later MPs will be easier to do. If you have someone or something else do the MP for you, that learning won't happen and you'll find later MPs much harder as a consequence.

You might find "C without the ++" to be a useful resource when working on this MP.

# Initial Files

`mp2.zip` contains a reference C++ implementation, a non-functioning C implementation, and build and testing supports like a Makefile and vscode project files.

The provided `dll.c` **does not compile** because it does not define the functions required by `dll.h`. Our first recommended step below is to add enough that it does compile.

The starter file does not include `stdio.h`, and you should not add it. Do not use any printing functions (such as `printf`) in your code. Instead, we recommend using the debugger. That lack of printing will be checked by `make test`, the command used to grade your code.

# Machine Problem

Implement a C version of the provided C++ code.

We recommend the following flow:

1. Stub out the implementation. That is, do the minimum possible to make it compile, generally by making empty or return-only function bodies.

2. Copy one function body from C++ to C and edit it to remove compiler errors. Pay particular attention to pointers and initialization: C++ calls initializers and destructors automatically which C does not.

3. Repeat until all functions are done.

4. Try it and debug it with the debugger.

## C you will need

You'll probably want to use `strlen`, `free`, and either `malloc` or `calloc`. Other functions defined in `string.h`, like `strcmp` and `memset`, are also permitted. The tests will verify that those are the only library functions that you use.

You'll be required to meet all the rules of C. This will be enforced by compiling with the following compiler flags:

**-Wall**
:   Enable all the warnings, even those that programmers often ignore.

**-Werror**
:   Makes warnings into errors, refusing to compile if there are warnings.

**-pedantic-errors**
:   Emit errors for things that the standard specifies but the compiler knows how to ignore.

**-std=c17**
:   Uses the official 2017 standard version of C, the last version to be widely supported by compilers.

You must not have any memory errors or leaks. This will be enforced in part using valgrind; the following invocation

```sh
valgrind --leak-check=full --show-leak-kinds=all ./dll_c whatever other arguments you want
```

must end with an "ERROR SUMMARY" reporting "0 errors" and no other error messages.

## Guide to changing C++ into C

### Replace namespaces with name prefixes

In C++, namespaces help different libraries not collide. In C, the tradition is to prefix every function and global variable name with the same prefix, like `glViewport` instead of just `viewport` in OpenGL or `sqlite3_open` instead of `open` in SQLite.

We use the prefix `dll` (double linked list) in our provided header file.

### Replace overloads and templates with name suffixes

In C++, `foo(int)` and `foo(double)` can co-exist; in C they cannot. The traditional solution is to add a type-specific suffix to the function name, like `sqrt(double)` and `sqrtf(float)`. If there's just a single parameter, suffixes based on `printf` percent codes are common; for anything more complicated there's no single pattern.

Templated functions can be removed in a similar type-suffix way, but if there's more than a few types expected it is more common to replace the templated-type argument with something like a type code and a `void *`.

We used the suffix `c` for what in C++ was a `<char>` template, and `s` for what was a `<std::string>` template.

### Explicit `this`

C has no built-in object orientation. As long as you are not using inheritance, this is a relatively small obstacle; just add the `this`-argument as the explicit first argument of each method and add a namespace-like renaming.

**Example:**

This C++ class

```cpp
class Pt2D {
  double x,y;
  Pt2D(double x, double y) { this.x = x; this.y = y; }
  void move(double x, double y) { this.x += x; this.y += y; }
  double theta() { return atan2(y, x); }
  double r() { return hypot(x,y); }
};
```

becomes this C code: a `.h` file containing

```c
typedef struct {
  double x,y;
} Pt2D;
void pt2d_init(Pt2D *self, double x, double y);
void pt2d_move(Pt2D *self, double x, double y);
double pt2d_theta(Pt2D *self);
double pt2d_r(Pt2D *self);
```

and a `.c` file containing

```c
#include "the h file you created.h"

void pt2d_init(Pt2D *self, double x, double y) { self->x = x; self->y = y; }
void pt2d_move(Pt2D *self, double x, double y) { self->x += x; self->y += y; }
double pt2d_theta(Pt2D *self) { return atan2(self->y, self->x); }
double pt2d_r(Pt2D *self) { return hypot(self->y, self->x); }
```

Note the above assumes a two-step creation: allocate, then initialize. If the intent is to always initialize on the heap (like C++'s `new` operator does) then we could instead (or in addition) do something like this:

```c
Pt2D *pt2d_new(double x, double y) {
  Pt2D *self = malloc(sizeof(Pt2D);
  self->x = x; self->y = y;
  return self;
}
void pt2d_delete(Pt2D *self) { free(self); }
```

### Language tweaks

Replace `new` with `malloc` + initialization.

Replace `delete` with `free` (preceded by deinitialization if there's a destructor).

Replace `std::string` with `char *`.

Replace operator overloading with explicit function calls: `strcat` instead of `std::string`'s `+` operator, `printf` instead of `cout`'s `<<` operator, and so on.

There are no `auto` declarations, iterator loops, or lambda expressions in C.

Replace pass-by-reference code with pass-by-pointer, adding needed `*`/`->` operators to make that work.

To match prevailing style, move where `*`s appear in type declarations. In C it is tradition to write `int *x`, not `int* x` like in C++. It is also traditional to declare multiple pointers per line, like `int *x, *y`.

# Testing Your Program

- Compile with `make`
- Test with `python3 tests.py`
    - If this does not run on your computer, you can do what it does manually:
        1. `make clean` followed by `make dll_c` should create `dll_c`
        2. `dll_c` and `dll_cpp` should have the same operation as one another, including with the following arguments:
            - `e`
            - `e f`
            - `one`
            - `one two three four five six`
            - `--help`
            - `one --help two`
        3. `valgrind` should report no errors

**Note: Permissive grading**

The provided tests for this MP do not test all features of the MP (intentionally: the goal of this MP is writing C, not writing robust code).

# Submission and Grading

Submit on the submission site. Only submit `dll.c`; do not modify any other file.

## Grading

This assignment is primarily a warm-up, graded fairly loosely. The score created by `make test` is the score you get on this MP.
