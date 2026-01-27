---
title: C
author:
    - Luther Tychonievich
...

This page outlines some of the key elements of the C language.
You might also be interested in [C without the ++](cppmm.html) which introduces how C differs from C++.


# How C became ubiquitous

In 1972, Dennis Ritchie introduced the C programming language.
He wrote it as part of his work on the Unix operating system, specifically to support that work.
Broadly speaking, his goal was to make a language that made common patterns in assembly programming easier to read and write without doing anything complicated.
Each C construct can be converted to a few simple assembly instructions,
and thus into a few simple machine instructions.

C has become one of the most popular programming languages ever designed.
Language popularity depends on many factors, but a few advantages of C that have helped it keep this position include:

- C compilers are easy to implement.
    There are no tricky or complicated parts of C under the hood, nor any parts that depend on uncommon machine instructions.
    There are also no legal constraints or intellectual property rights to make the implementation complicated.
    
    C can also be "bootstrapped" fairly easily:
    most of the harder parts of a full C compiler
    can be written using just a simpler subset of C.
    To make a full C compiler for new hardware,
    we can implement just the simpler subset of C
    and then use that written-in-simple-C implementation of the rest of the compiler to get a full compiler.
    
- C has no hidden performance costs or control flow nuances.
    There's no garbage collector to add nondeterministic pauses;
    no polymorphism to add hidden bytes of object state;
    no inheritance, overloading, or overriding to make it tricky to determine which function will be called;
    no operator overloading to make it uncertain what a given operator actually does;
    no borrow checker to insert memory management code we didn't write explicitly;
    no coroutines to make stack memory and instruction scheduling complicated;
    and so on.
    
    This makes C particularly common when working on hardware-facing software.
    Fields such as networking, security, embedded systems, and operating systems
    often use C for at least part of their work.
    
- C has been used as a basis for other popular languages.
    
    C++ was based on C in both appearance and functionality; Java was based on C++, and C# was based on Java.
    JavaScript also chose to look like Java, and thus like C, although it works very differently under the hood.
    Because all of these C-derived languages have become very popular,
    most programmers find that C syntax and semantics feels familiar even if they've not written C itself before.

# Standard defined, implementation defined, and undefined

The C standard fully defines some aspects of the language and the compiler ecosystem.

:::example
`(x[3])`{.c} is defined in the standard to mean the same thing as `(*(x+3))`{.c}.
This will hold on all computers across all C compilers.
:::

:::example
The C standard requires that the compiler be named `cc`.
Most implementations *also* give it another name,
like `gcc` or `clang` or `icc`,
but the standard requires it to be available under the name `cc`.
:::


The C standard also leaves some aspects of the language to be "implementation defined."
They must be consistent across a single compiler compiling to a single target hardware,
but may differ between compilers and targets.

:::example
The number of bytes in an `int` is implementation defined.
Most modern compilers and targets set it to be 4 bytes, but the standard also allows it to be as few as 2 bytes.
However, its size must be fully defined by a compiler;
the compiler cannot choose to make `int` 2 bytes in one place and 4 bytes in another:
it picks a number of bytes and sticks to that choice.
:::

:::example
The signedness of `char` is implementation defined.
On one computer `char` might mean the same as `signed char`, meaning `((char)-20) < 0`{.c} is true;
on another it might mean the same as `unsigned char`, meaning `((char)-20) > 0`{.c} is true instead.
:::

The C standard further leaves some behaviors to be "undefined."
This means that the compiler can do anything it wants when those situations arise:
crash, pick something at random,
pick the fastest of several options,
and so on.
Some undefined behaviors have defined constraints on what they can do (such as never crashing), while others do not.
Undefined behaviors create flexibility for optimizing compilers
and for porting the language to new hardware,
but they also can lead to a variety of hard-to-track-down bugs.

:::example
The value of uninitialized variables is undefined by the C standard.
Thus, the following code

```c
int x;
printf("%d\n", x);
```

could print literally any legal `int` value.
With one compiler on one computer it might always print `0`;
on another it might always print `340340340`;
on a third it might print different values each time it is run;
and so on.
But it will never crash or print a noninteger:
the value in the variable is undefined, but it is a value and is an `int`.
:::

:::example
The values stored in heap memory pointed to by the return value of `malloc`{.man3} is undefined,
but the values stored in heap memory pointed to by the return value of `calloc`{.man3} is defined.
Whether there is any value in heap addresses outside of memory allocated by `malloc` or `calloc` is undefined,
and if there are values what they are is also undefined.

Thus, the following code

```c
int *x = malloc(2 * sizeof(int));
int *y = calloc(2, sizeof(int));
printf("A: [%d, %d]\n", x[0], x[1]);
printf("B: [%d, %d]\n", y[0], y[1]);
printf("C: [%d, %d]\n", x[2], y[2]);
```

could print 

1. `A: [2134, 928273640]` or any other pair of legal int values.
2. `B: [0, 0]` -- calloc initialized its memory, so this is the only option for the `B:` line.
3. `C: [-234561341, 12131145]` or any other pair of legal int values; or, this command might crash while trying to access unallocated memory.
:::



# Always pass-by-value

C only has one way of assigning variables or passing values into functions:
by value.
That means *copying the bytes* that make up the value;
what some other languages call a "shallow copy."

:::example
```c
void foo(int a[3]) { // a gets a copy of the bytes stored in the array
    a[2] = 1; // this changes only the local copy
}

int main(int argc, char *argv[]) {
    int x[3] = {3,4,0};
    foo(x);
    printf("%d%d%d\n", x[0], x[1], x[2]); // prints 340 not 341
}
```
:::


This also applies to pointers.
A pointer is a value, represented by bytes.
Those bytes happen to be the address of a different value,
but for the purposes of assignment and function invocation they are treated like any other bytes.
However, C will automatically convert any array into a pointer to its first element if the variable or argument has that type.

:::example
```c
void foo(int *a) { // a gets a copy of a pointer, not of the pointed-to memory
    a += 1; // this updates the local pointer to point 1 int later in memory
    a[1] = 1; // this follows the pointer to change a number it points to
}

int main(int argc, char *argv[]) {
    int x[3] = {3,4,0};
    foo(x); // automatically converted to a pointer, as if we wrote foo(&(x[0]));
    printf("%d%d%d\n", x[0], x[1], x[2]); // prints 341, not 340 nor 310 nor 410
}
```
:::

# No string class

In C, string literals are arrays of `char` values; if assigned to a pointer, they are stored in global read-only memory before the pointer is created.
String literals have a special char "null" `'\0'`{.c} added to the end, helping mark the end of the array.
All functions in the C standard library that work with strings
actually work with any pointer to a null-terminated array of `char`s.

:::example
The following code creates three arrays with the same contents:
```c
const char *s1 = "CS@UIUC";
char s2[] = "CS@UIUC"; 
char s3[8] = {'C', 'S', '@', 'U', 'I', 'U', 'C', '\0'};
```

The contents are as follows:

<figure>
```pikchr
box "C" fit
box "S" fit
box "@" fit
box "U" fit
box "I" fit
box "U" fit
box "C" fit
box "\\0" fit
text "0" with .n at 1st box.s
text "1" with .n at 2nd box.s
text "2" with .n at 3rd box.s
text "3" with .n at 4th box.s
text "4" with .n at 5th box.s
text "5" with .n at 6th box.s
text "6" with .n at 7th box.s
text "7" with .n at 8th box.s
```
<figcaption>An 8-element 0-indexed array, containing `{'C', 'S', '@', 'U', 'I', 'U', 'C', '\0'}`{.c}</figcaption>
</figure>

The array created for `s1` will be stored in read-only global memory, with a pointer to that memory stored in `s1`.
The arrays created for `s2` and `s3` will be stored in the stack if they are local variables
or in read/write global memory if they are global variables.
:::

The standard library header file `string.h`{.man0p} contains a wide set of convenience functions
to use when working with strings,
as well as some to use when working with other arrays.
For example,

- `strlen`{.man3} loops through the bytes of an array, returning the index of the first 0 byte;
    for strings, this gives the length of the string (for example `strlen("CS@UIUC")`{.c} is 7.

- `strcmp`{.man3} compares two strings, returning 0 if they are identical,
    −1 if the first is earlier in alphabetical order,
    or +1 if the second is earlier in alphabetical order.

- `strchr`{.man3} and `strstr`{.man3} search for values inside a string;
    `strchr` looks for a single character while `strstr` looks for a larger substring.

Because C does not manage memory for you, some common string operations are more complicated than you might expect.
For example `strcat`{.man3} concatenates strings, but requires that you already have allocated a single array big enough to hold the concatenated string before you call it;
if you haven't it will try to do the work anyway even though there's not enough memory, resulting in undefined behavior^[This particular not-enough-memory undefined behavior is one source of a [buffer overflow attack](https://en.wikipedia.org/wiki/Buffer_overflow), a common source of security vulnerability that can result in complete loss of system control to an attacker.].

The most common way to handle strings is to use pointers to them.
If the value pointed to was initialized by a string literal, the array is in read-only memory and cannot be modified, making functions like `strsep`{.c} not work correctly (generally crashing at runtime);
but if it was initialized in another way then it will be in read/write memory and `strsep`{.c} and the like will work.

:::aside
The operations in `string.h`{.man0p} are all just convenience functions;
you could implement your own set of functions with different behaviors if you wished.
Because they are in the standard library and align with how string literals work, they are commonly used,
but you will sometimes see code that uses its own, different string structures.
:::

# File descriptor and `FILE *`

The C standard library has two main ways of working with files.

## File Descriptors

File descriptors are a thin wrapper around how the operating system manages files.
We describe file descriptors more in the [kernel mode](kernels.html) page.
File descriptors are used by the library functions `open`{.man2}, `read`{.man2}, `write`{.man2}, and `close`{.man2},
defined in `fcntl.h`{.man0p} and `unistd.h`{.man0p}.

## File pointers

The C library provides a number of "buffered I/O" functions
that interact with a `FILE *`{.c} argument,
defined in `stdio.h`{.man0p}.

A `FILE *`{.c} is what is known as an **opaque pointer**:
the compiler is not given any information about the data being pointed to besides its type name,
preventing you from writing code that interacts with the contents of that structure.
Each implementation of the standard library may have its own way of storing a `FILE` structure,
but the usual idea is to store both a [file descriptor] and an array called a buffer.
Most operations you do will interact with the buffer,
which will only be synced to disk via the file descriptor when the buffer is full (if writing) or empty (if reading).
This means that closing a `FILE *` is an important step in ensuring that what you did to it actually reaches the disk.

Each program initially has three open `FILE *`s in the global scope:
`stdout` and `stderr` are opened in write-only mode
and `stdin` is opened in read-only mode.

## File modes and positions

A file may be opened in several different modes.
The most common modes (with their `fopen`{.man3} `mode` argument values) are:

- `r` -- read only. The file position starts at the beginning of the file, and you can't write to it, only read.
- `w` -- write only. The file is erased when it is opened and you can't read from it, only write.
- `a` -- append only. This is like `w`, except the file is not erased and every write gets put at the end of the file.
- `r+`-- reading and writing. The file position starts at the beginning of the file, and you can both read and write data.

Each file has a notion of a "file position".
Early files worked on magnetic tape held between two reels,
with just one spot on the tape underneath the magnetic head that could read and write the contents of the tape.
To read 20 bytes^[Bytes are a unit of digital information. We will dive more into this topic later in the course.] of data, you also had to advance the tape by 20 bytes,
meaning the next read would start after the first.
This concept remains the dominant model for files today:
they may be just large arrays of bytes under the hood,
but the operating system APIs that let you access them
have a notion of a position that is advanced every time you read or write.
If you want to change that position in any other way, you have to explicitly "seek" a new position.

For `FILE *`s, `fseek`{.man3} and `ftell`{.man3} will let you manually manipulate the file position.

## Byte-oriented I/O

Files store bytes.
`fread`{.man3} lets you read an array of bytes from a file,
and `fwrite`{.man3} lets you write an array of bytes to a file.
You can also work one byte at a time using `fgetc`{.man3}, `fputc`{.man3}, though those are less efficient.


`fread`{.man3} and `fwrite`{.man3} use the `void *`{.c} type for the array they read to or write from.
`void *`{.c} means "a pointer to something, but the compiler can't tell what."
To help the functions know how to write those values,
we have to tell it two more pieces of information:
first, the size (in bytes) of a single element in the array pointed to by the `void *`{.c};
and second, the number of elements in that array.

:::example
To write the bytes of an array of `long`s to a file, we might do the following:

```c
long x[4] = {124, 128, 225, 340};
FILE *myfile = fopen("demo.dat", "w");
fwrite(x, sizeof(long), 4, myfile);
fclose(myfile);
```

To read it back again we'd do

```c
long y[4];
FILE *myfile = fopen("demo.dat", "r");
fread(y, sizeof(long), 4, myfile);
fclose(myfile);
```

Note that writing values in this way generally results in non-cross-platform files
because the exact bytes used to store a value is implementation defined.
:::

## String-oriented I/O

The C standard library has various string-oriented reading and writing functions.
The most versatile are `fprintf`{.man3} and `fscanf`{.man3},
but there are others like `fgets`{.man3}, `getline`{.man3}, and `perror`{.man3}.

The only one of these functions that we'll use in CS 340 is `printf`{.man3},
which wraps `fprintf`{.man3} to always use `stdout` as its `FILE *`.

`printf` is a **variadic function**, meaning it can be called with a variable number of arguments.
It's first argument is always a string,
with the string being parsed to figure out how many other arguments they will be and their types.
Arguments are noted in the string using "conversion specifiers",
which are a `%`, optionally some formatting information, and a letter.
There are many conversion specifiers, but the following are particularly common:

`%s`
:   A string (i.e. a `char *`)

`%d`, `%u`, `%x`
:   An integer, to be displayed in base-10 signed (`%d`), base-10 unsigned (`%u`), or base-16 unsigned (`%x`)

`%p`
:   A pointer, displayed in hexadecimal

`%f`, `%e`, `%g`
:   A floating-point number, displayed in fixed point (`%f`), exponential notation (`%e`), or whichever is smaller (`%g`)

These often have additional information between the `%` and the letter. For example,

- `%zd`, where the `z` means "treat the integer as a `size_t`{.c}"
- `%llx`, where the `ll` means "treat the integer as a `long long`{.c}"
- `%.4g`, where the `.4` means "show four digits of precision"

Mastering all `printf` conversion specifiers is unlikely to be worth your while,
but learning enough to display basic information is.

:::example
The following shows how to display the value of three variables using `printf`.
```c
void f(int x, const char *s, double y) {
    // ...
    printf("%s (%d): x=%d, s=\"%s\", y=%g\n", x, s, y);
    // ...
}
```
:::

# Heap memory

C does not have a `new` or `delete` operator.
It also never implicitly creates or expands memory.
If you want to allocate, adjust, or deallocate memory, you have to use a function to do so.

There are several operating-system-level memory allocation functions, such as `brk`{.man2}, `sbrk`{.man2}, and `mmap`{.man2}, but they are challenging to use well and should generally be avoided.
Instead, almost all C code uses four functions found in `stdlib.h`{man0p}:
`malloc`{.man3}, `free`{.man3}, `realloc`{.man3}, and `calloc`{.man3}.

`malloc`{.man3} allocates a contiguous range of bytes and returns a pointer to the first byte.
It leaves *undefined* what the values of those bytes are.

`calloc`{.man3} is much like `malloc`, except it sets all the bytes to 0 before returning the pointer.
It also has two size arguments to make it less likely that programmers will make certain mistakes when allocating arrays.

`free`{.man3} accepts a pointer returned by `malloc` (or `calloc` or `realloc`) and deallocates the memory it points to.

`realloc`{.man3} "resizes" a region of memory.
Roughly that means that it (a) `malloc`s a new region of memory; (b) `memcpy`{.man3}s byte values from the old to the new; (c) `free`s the old; and (d) returns a pointer to the new.
In practice, it is often much more efficient than that set of steps, in some cases requiring almost no time at all.

When working with these functions, it is important to obey the following rules:

- Once a piece of memory is `free`d, **do not** refer to that memory in any way again.
    
    Failure to follow this rule is called the "use after free" error (or the "double free" if the second reference is using the pointer as an argument to `free`) and is a major security vulnerability that can result in attackers compromising your system.

- Never attempt to access anything outside the bounds of an allocated block of memory.
    
    Failure to follow this rule can have a variety of unexpected results; it might crash the program, or change how it operates in all cases, or change how it operates in just a few special cases, or introduce a security vulnerability.

- Never lose track of a `malloc`ed pointer without first `free`ing it.
    
    Failure to follow this rule is called a "memory leak" and can significantly harm the performance of your program, and in some cases all other programs running on your computer.

- Never `free` anything that wasn't returned by `malloc`, `calloc`, or `realloc`.
    
    Failure to follow this rule usually causes a program to crash, though sometimes it doesn't seem to do anything.
    If it is paired with another error like use after free, it can exacerbate the other error's results.
    
    This rule means the *exact* pointer. `free(malloc(100)+50)`{.c} is an error; the pointer being freed does point to memory inside a `malloc`ed block of memory, but is not the exact pointer that was returned by `malloc`.


Some other standard library functions explicitly mention `malloc` and/or `free` in their documentation; for example, `strdup`{.man3} says in part "Memory for the new string is obtained with **malloc**(3), and can be freed with **free**(3)."
This is documented so that you know how the above rules apply to those functions too.

