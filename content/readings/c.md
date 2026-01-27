---
title: Additional C Information
author: Luther Tychonievich
---

This page outlines some of the historical and nuanced elements of the C language. You might also be interested in [C without the ++](cfromcpp) which introduces how C differs from C++.

# How C became ubiquitous

In 1972, Dennis Ritchie introduced the C programming language. He wrote it as part of his work on the Unix operating system, specifically to support that work. Broadly speaking, his goal was to make a language that made common patterns in assembly programming easier to read and write without doing anything complicated. Each C construct can be converted to a few simple assembly instructions, and thus into a few simple machine instructions.

C has become one of the most popular programming languages ever designed. Language popularity depends on many factors, but a few advantages of C that have helped it keep this position include:

- **C compilers are easy to implement.** There are no tricky or complicated parts of C under the hood, nor any parts that depend on uncommon machine instructions. There are also no legal constraints or intellectual property rights to make the implementation complicated.
    
    C can also be "bootstrapped" fairly easily: most of the harder parts of a full C compiler can be written using just a simpler subset of C. To make a full C compiler for new hardware, we can implement just the simpler subset of C and then use that written-in-simple-C implementation of the rest of the compiler to get a full compiler.
    
- **C has no hidden performance costs or control flow nuances.** There's no garbage collector to add nondeterministic pauses; no polymorphism to add hidden bytes of object state; no inheritance, overloading, or overriding to make it tricky to determine which function will be called; no operator overloading to make it uncertain what a given operator actually does; no borrow checker to insert memory management code we didn't write explicitly; no coroutines to make stack memory and instruction scheduling complicated; and so on.
    
    This makes C particularly common when working on hardware-facing software. Fields such as networking, security, embedded systems, and operating systems often use C for at least part of their work.
    
- **C has been used as a basis for other popular languages.** C++ was based on C in both appearance and functionality; Java was based on C++, and C# was based on Java. JavaScript also chose to look like Java, and thus like C, although it works very differently under the hood. Because all of these C-derived languages have become very popular, most programmers find that C syntax and semantics feels familiar even if they've not written C itself before.

# Standard defined, implementation defined, and undefined

The C standard fully defines some aspects of the language and the compiler ecosystem.

**Example:** `(x[3])` is defined in the standard to mean the same thing as `(*(x+3))`. This will hold on all computers across all C compilers.

**Example:** The C standard requires that the compiler be named `cc`. Most implementations also give it another name, like `gcc` or `clang` or `icc`, but the standard requires it to be available under the name `cc`.

The C standard also leaves some aspects of the language to be "implementation defined." They must be consistent across a single compiler compiling to a single target hardware, but may differ between compilers and targets.

**Example:** The number of bytes in an `int` is implementation defined. Most modern compilers and targets set it to be 4 bytes, but the standard also allows it to be as few as 2 bytes. However, its size must be fully defined by a compiler; the compiler cannot choose to make `int` 2 bytes in one place and 4 bytes in another: it picks a number of bytes and sticks to that choice.

**Example:** The signedness of `char` is implementation defined. On one computer `char` might mean the same as `signed char`, meaning `((char)-20) < 0` is true; on another it might mean the same as `unsigned char`, meaning `((char)-20) > 0` is true instead.

The C standard further leaves some behaviors to be "undefined." This means that the compiler can do anything it wants when those situations arise: crash, pick something at random, pick the fastest of several options, and so on. Some undefined behaviors have defined constraints on what they can do (such as never crashing), while others do not. Undefined behaviors create flexibility for optimizing compilers and for porting the language to new hardware, but they also can lead to a variety of hard-to-track-down bugs.

**Example:** The value of uninitialized variables is undefined by the C standard. Thus, the following code

```c
int x;
printf("%d\n", x);
```

could print literally any legal `int` value. With one compiler on one computer it might always print `0`; on another it might always print `340340340`; on a third it might print different values each time it is run; and so on. But it will never crash or print a noninteger: the value in the variable is undefined, but it is a value and is an `int`.

**Example:** The values stored in heap memory pointed to by the return value of `malloc` is undefined, but the values stored in heap memory pointed to by the return value of `calloc` is defined. Whether there is any value in heap addresses outside of memory allocated by `malloc` or `calloc` is undefined, and if there are values what they are is also undefined.

Thus, the following code

```c
int *x = malloc(2 * sizeof(int));
int *y = calloc(2, sizeof(int));
printf("A: [%d, %d]\n", x[0], x[1]);
printf("B: [%d, %d]\n", y[0], y[1]);
printf("C: [%d, %d]\n", x[2], y[2]);
```

could print:

1. `A: [2134, 928273640]` or any other pair of legal int values.
2. `B: [0, 0]` -- calloc initialized its memory, so this is the only option for the `B:` line.
3. `C: [-234561341, 12131145]` or any other pair of legal int values; or, this command might crash while trying to access unallocated memory.

