---
title: Memory Management
author: Luther Tychonievich
---

# Globals

Global memory is not managed.
It is allocated once when the program is first being loaded and never changes size thereafter.

Global memory is split into several regions, notably including:

- Code, which may be executed but not otherwise accessed.
- Read-only globals, in particular including all string literals.
- Normal globals, including all variables declared outside of any function and `static` variables declared inside functions.

# The Stack

The stack is automatically managed by the compiler and is linked to function calls.
It exists in a large segment that is set aside for the program is first being loaded, though most of that segment is initially unused.
Each new function's activation record (its arguments, return value, return address, and local variables)
is pushed on the stack when the function is invoked
and popped off the stack when the function returns.
After a function returns, addresses of its local variables still exist, but using them is problematic because that memory will be re-used by the next function to be called.

The stack has two common bugs:

- "Use after return" -- if a pointer to stack memory outlives the function that allocated the memory, it still runs (the pointer is to valid memory) but no longer runs correctly (it's pointing to memory the program is now using for something else).
- "Stack overflow" -- if a function puts too much data on the stack or deep recursion causes too many stack frames to be allocated at once, the stack and exceed the size of the segment the OS set aside for it.

# Heap, level 0: `sbrk`

The segment of memory storing the heap is initially small or even empty.
The beginning of that segment is fixed, but the end of that segment can be changed by the operating system.
How we ask the OS to change that end-of-heap-segment marker
varies by OS, but a common one is `sbrk`
which accepts a delta change in the number of bytes to allocate for the heap.

When using `sbrk`, the heap is just a big continuous range of addresses.
Any internal structure and usage is up to you.
One of the most popular internal structures is managed by `malloc`{.man3}.

# Heap, level 1: `malloc` and friends

`malloc`{.man3} and its related functions `free`, `calloc`, and `realloc` use `sbrk` to request heap memory from the OS,
then add their own bookkeeping to the big region of available memory,
thus chopping it into smaller pieces that can be individually managed and deallocated.

There are several implementations of `malloc`,
but they generally share the following features:

- Bookkeeping data is stored just before the pointers `malloc` returns.
    When `free` is called it it looks before the pointer to find that bookkeeping and decide how much memory to make available.

- `malloc` prefers to return memory that has been `free`d rather than create new memory.

- `malloc` wants to avoid and remove *fragmentation*, meaning many small freed chunks instead of one big freed block.
    There are many different tools to try to achieve this,
    such as merging adjacent free chunks into a larger chunk,
    preferring to allocate into the smallest available chunk that is large enough,
    grouping allocations of similar size near one another in the heap, and so on.

Languages like C++ often wrap `malloc` in an operator like `new` which does two things:
first, it `malloc`s space for whatever it is creating;
then it runs a function called a "constructor" to initialize the contents of that memory.
Likewise, `delete` wraps `free` with a destructor before the `free`.
That said, they C++ has its own implementation of `malloc` that manages the heap and its bookkeeping differently than `malloc` does, so the two do not play well with one another.

# Heap, level 2: tracking lifetimes

Memory management with `malloc`-like functions is a source of *many* programmer errors.
Three are particularly common:

- "Memory leak" occurs when the program stops using some region of `malloc`ed memory but doesn't `free` it. The longer a program with a memory leak runs, the more memory it claims without using it.

- "Use after free" occurs where a region of memory is `free`d but accessed after that. This is the heap version of "use after return" with similar consequences: the memory will be re-used for a different purpose by a future `malloc`, creating strange behaviors.

- "Double free" is a specific variant of "use after free" where the "use" is `free`ing a second time. This has the same kinds of problems as other "use after free" (it might accidentally free a different `malloc`'s return, meaning multiple pointers might point to the same region of memory) but is common enough in code to get its own name.

To avoid these errors, most `malloc`-based code uses a notion of "lifetimes" to track when a given pointer should be freed.
For example, the lifetime of a BST node might be from the moment of its allocation to the moment where its parent node points to something else instead of it; at that end of life time it should be `free`d.
Often, these lifetimes are tracked only in the programmer's mind,
but two common techniques track it automatically:

- *Reference counting* pairs a pointer with a counter of the number of things keeping it alive. Every time the pointer is copied, the counter is incremented. Every time a pointer goes out of scope, the counter is decremented. Once the counter reaches zero, the pointer's lifetime has expired and the pointer can be `free`d.
    
    Some large C libraries use reference counting to manage their object lifetimes and require invoking code to handle them in a particular way to ensure the counters are correctly maintained.

    Reference counting suffers from memory leaks when end-of-life memory contains a cycle of pointers to other end-of-life memory, preventing any of their reference counts from reaching zero. This is quite common with pointer data structures like doubly-linked lists and makes reference counting a tricky tool to correctly employ.

- *Ownership tracking*, popularized in the Rust language, requires that each pointer be owned by a specific block of code or other memory region and enforces that when the owner goes out of scope, the pointer is `free`d. This is generally implemented in the programming language itself and enforced by the compiler's type checker.

    Language-level ownership tracking prohibits some coding patterns and requires some extra annotation to make others work. Some programmers appreciate this as a way of preventing risky coding practices. Others find it frustrating.

# Heap, level 3: garbage collection

**Garbage** is defined as allocated heap memory that will never be used by the program again.
**Unreachable memory** is a subset of garbage that *cannot* be used again because no pointers to it are still available to the program.
**Garbage collectors** are tools that search through the registers and stack to find what pointers do exist, then through the heap to find allocated memory that isn't reachable from those pointers, then `free`s all such memory.

Garbage collectors take time to run (they have to read the entire stack and skim much of the heap) and add extra constraints to how memory is used (for example, pointers cannot be compressed or encrypted). However, they make it much easier to write code because deallocation and lifetimes needn't be considered.

Garbage collectors are built in to most high-level languages, including Java, Python, JavaScript, Bash, and so on.
These languages are characterized by having a way of allocating memory and creating objects, but no explicit way of deallocating them because deallocation is handled by the garbage collector instead.
There are multiple designs of garbage collectors, and which one a language uses can have a noticeable impact on what kinds of code are slowed down by the garbage collector the most.

The languages I know that do not have mandatory language-level garbage collectors^[Here I'm treating language-automated reference counting as a form of garbage collection, though that's not always the right way to think of it.] are:

- Fortran, though most Fortran code I've seen doesn't use the heap.

- Rust, because it has type-checker-enforced ownership tracking and compiler-inserted deallocations instead.

- C, C++, and Zig. There are a few third-party garbage collector libraries that can be used with these languages, most popularly the [Boehm garbage collector](https://www.hboehm.info/gc/), but I've almost never seen these used in production code.

- D and V have language-level garbage collectors that can be mixed freely with manual `malloc`-style allocations, disabled selectively for certain functions, or disabled entirely from the command line.

