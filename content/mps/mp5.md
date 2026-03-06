---
author: Luther Tychonievich
subtitle: Allocator
title: MP5
---

# Overview

In this Malloc Party (MP), you will implement your own memory
allocator.

Different programming languages provide programmers with access to
memory at different levels of abstraction. In C, you typically use
`malloc`, `free`, and `realloc`. In this MP, you will re-implement those
behaviors yourself.

You are given a large pool of memory to manage manually. Your goal is to
support the full behavior of `malloc`, `free`, and `realloc` on top of
that pool while:

-   Preserving correctness
-   Minimizing memory usage
-   Maximizing runtime efficiency

This assignment helps build a deeper mental model of how memory works
beneath C's abstractions and prepares you for reasoning about low-level
systems behavior.

# Initial Files

[`mp5.zip`](../mp5.zip) contains a very simple, space-inefficient solution
as well as VS Code project files and tests.
You will modify

- `allocator.c` -- most of your work will go here
- `mytest.c` -- optionally, write your own test case here

# Naive Implementation

We provide the simplest functionally-correct implementation we know of.
It treats the heap like a stack that never pops:
on allocation it pushes a new block on top of the stack
and ignores all deallocations.

``` c
#include "allocator.h"
#include <string.h> // for memcpy

static void *base;  /// the smallest usable address
static size_t used; /// how many byes have been used


/** Called once before any other function here.  *
 * Argument is the smallest usable address.      */
void allocator_init(void *newbase) {
  base = newbase;
  used = 0;
}

/** Called once before each test case.               *
 * Free any used memory and reset for the next test. */
void allocator_reset() { used = 0; }


/** Like malloc but using the memory provided to allocator_init */
void *mymalloc(size_t size) {
  // simplest version pushes each block on a stack
  void *ans = base + used;
  used += size;
  return ans;
}

/** Like free but using the memory provided to allocator_init */
void myfree(void *ptr) {
  // simplest version does nothing
}

/** Like realloc but using the memory provided to allocator_init */
void *myrealloc(void *ptr, size_t size) {
  // simplest version is malloc-copy-free
  if (!size) { myfree(ptr); return NULL; }
  void *ans = mymalloc(size);
  if (ptr && ans) {
    memcpy(ans, ptr, size); // should be min(size, oldsize) but oldsize unknown
    myfree(ptr);
  }
  return ans;
}
```

# What You Should Do

Keep the functional correctness of the provided allocator
but make it use less memory without adding too much time.
That will involve at least the first 6 of the following steps.
The steps in the following subsections are ordered such that earlier items are easier to implement than later ones
and also are either have more impact on memory use than later ones or are required components of later ones.
Going in order is strongly recommended.


### Small testable steps, a professional practice

As you walk through these steps, you will find yourself doing something in step n
and then partially undoing it as part of step m>n.
This is part of a general pattern of effective software development:
we don't write large code all at once,
we write it as a series of small changes, each individually testable.

It is possible to read all the steps, then try to do them all at once.
Technically this *could* result in writing less code overall.
Practically it would *actually* result in writing buggy code and then having no idea which part is incorrect.
If you possibly can, you should *always* code in small testable steps,
even if that means some of those steps involve a bit of extra work (which you might undo later) to get an intermediate step into a testable configuration.


### Making your own tests

The provided test cases in the `workloads` folder are intended to test both the functionality and performance of your code.
Being useful cases for debugging your code was not a design goal of these workloads.

If your code *crashes*, you might want to write your own test file with its own `main` function and so on that calls your allocation functions.
This can help you not get distracted by the memory tracking system in `testharness.c`.

If your code gives an allocator correctness error (such as "allocated illegal address" or "allocated already-used memory"), then the testharness might be useful in debugging, but you should probably minimize the test case before debugging.
This means copying the test into `mytest.c` and then removing as much of it as you can without making the test pass.
In other words,

1. Make `mytest.c` fail (when compiled to `mytest.so` and run using the test harness).
2. Repeat several times:
    a. Remove something from mytest.c (delete a line, reduce a loop count, etc).
    b. If mytest now passes, reinsert what you just removed.
3. Debug the single mytest.so workload, using the "Debug one workload" run option, not "Debug all workloads" or "Run all tests".

## 1. Metadata

Add metadata to each allocation.
The usual way to do this is: when asked for an n-byte block,
allocate an n + sizeof(metadata) block. Write to the first sizeof(metadata) bytes the metadata and then return a pointer to the first byte after the metadata.

If given a non-NULL ptr, look sizeof(metadata) before it to read the metadata for that block.

You'll want to change your metadata as you add more features,
but initially just store the size of the block in it. This will make your code take more time and need more space, but it will also unlock later changes.

With size metadata it becomes possible to display your entire memory:
you know where the first block is, and from its size can find the next, and so on.
You might find this useful in some debugging situations, and for doing step 5 below.


## 2. Shrink efficiently

In `realloc`, if the user is requesting a smaller or same sized block, do nothing. 

This will improve your code's **runtime** and **space**.

This will cause the `realloc_jitter` test to use under 5,000 bytes instead of over 50,000.

## 3. Grow at end of heap

Don't copy data or change the pointer when increasing the size of the block at the end of the allocated memory.

This will improve your code's **runtime** and **space**.

This will cause the `small_resize` test to use under 1,000 bytes instead of over 10,000.

## 4. Shrink at end of heap

When deallocating (with `myfree`) or decreasing (with `myrealloc`) the size of the block at the end of the allocated memory,
also return its memory to the unused memory set.

This will improve your code's **space**.

This will cause the `backstep` test to use under 200,000 bytes instead of over 1,000,000
and `mergesort_like` to use under 200,000 bytes instead of over 700,000.

## 5. Reuse free memory

When deallocating a block that has another block after it,
mark it in some way as being unused (likely in the metadata).
If a later allocation wants a block smaller than some current unused block, return the unused block instead of allocating a new block.

If you know block sizes and where the first block is,
you can use that to walk the entire set of blocks looking for a large-enough unused block.

This will improve your code's **space** but harm it's **runtime**.

This will cause the `chaos_reuse` test to use under 1,000 bytes instead of over 20,000
and `chaos_reuse_2` use under 10,000 bytes instead of over 100,000.
However, it will slow down most tests, especially `linked_list`;
on my computers it slows that test down to take several seconds, but I've had reports that on some machines it slows them to several *minutes* instead.

### Skipping a test

You might want to skip long-running tests.
There are at least three ways to do that; any one of these approaches should work.

- Run tests selectively, using the "Test one workload" run action or `./tester workloads/chaos_reuse.so`{.sh} command-line invocation.
- Temporarily edit the tests you want to skip, commenting out all lines in their `mytest` functions other than `return 0;`. To re-enable them, uncomment those lines.
- Move the tests (both .c and .so) out of the `workloads/` folder. To re-enable them, move them back into that folder.


## 6. Free list

Avoid scanning through used blocks for unused blocks.
Large linked data structures may have millions of small used blocks;
scanning through them looking for unused blocks can be time-prohibitive.

You can avoid every looking at a used block when hunting for unused blocks
by creating some kind of linked data structure (linked list, tree, etc)
of unused blocks with nodes stored inside the unused blocks (or their metadata)
and a root/head/tail pointer as a global variable, then walking that structure on each allocation.

When creating this structure, it's good practice to try to serve allocations with the most-recently-freed block first.
This will tend to improve cache performance and is optimized for the common case
where a free of an n-byte block is followed by an allocation of another n-byte block.

Remember to reset the structure when `allocator_reset` is called.

This will improve your code's **runtime**, but may worsen its **space** slightly if it makes your metadata larger.

This should result in runtimes similar to step 4 and space utilization comparable to step 5.

## 7. Block merging [Extra Credit]

When marking a block as unused, see if the block before and/or after it in memory are also unused; if so, merge them into one large unused block instead of several smaller ones. Do this *before* the end-of-memory deallocation optimization (step 4)

Make sure this doesn't mess up the links between unused blocks added in step 6.
Also note that adjacent-in-memory blocks are rarely adjacent in the list of free blocks.

This is mostly a pair with splitting blocks, and in most cases the two will only result in space savings
if they are both implemented correctly.
However, they are sufficiently distinct operations that they are usefully implemented and tested independently.

This will cause `small_resize_2` to use under 3,000 bytes instead of over 20,000;
but it will cause several previous tests to lose their previous gains (for example, `chaos_reuse` and `chaos_reuse_2` will use 10× more memory) and it may stop passing some of the earlier steps it used to pass.
Without the next step, a mixed win at best.

## 8. Block splitting [Extra Credit]

When allocating into a large unused block, split that block in two, one used for the new allocation and the other one left unused.
Do the same when shrinking a block during reallocation.

Make sure you include space for the metadata needed by *both* blocks when splitting;
if there's not enough space to split into two blocks, don't split.

Make sure this doesn't mess up the links between unused blocks.
Also note that adjacent-in-memory blocks are rarely adjacent in the list of free blocks.

This will improve your code's **space**.

This will keep the gains to `small_resize` and `small_resize_2` from step 7
and return `chaos_reuse` and `chaos_reuse_2` to under 1,000 and under 10,000 byes, respectively.
It will also cause `backstep` to use under 200,000 bytes instead of over 1,000,000
and `backstep_2` to use under 1,500,000 bytes instead of over that.


# Scoring

`make test` will be used to grade your code.
It will show how many steps you have completed, based on performance.
Steps 7 and 8 are merged in the tests, as 7 without 8 is worse than not doing 7.

Implementing up through step 6 (Free List) is worth 100%.
Partial credit is awarded for doing fewer steps.

**No points** are earned if the allocator you submit is **nonfunctional** (i.e. fails to return non-overlapping large-enough memory with each `mymalloc` call).
We strongly recommend keeping a copy of your last points-earning implementation so that you can revert to it if you get your code into a broken state.

Step 7 and 8 (block splitting and merging) gives 0.5% extra credit to your overall course grade. There is a seperate autograder for getting extra credit. You must submit to both autograders to get full credit and the extra credit. 
