---
title: Memory Caches
author: Luther Tychonievich
---

**Important:** The bigger memory is, the longer it takes to access.

This is true because of physics: memory takes up space and information takes time to travel through that space.

This is true because of engineering: faster memory uses up more power, creating more heat, which can be dissipated from small areas effectively but will overheat larger ones.

This is true because of economics: the fastest memory technologies are more expensive than slower ones and we can't afford a large amount of high-speed memory.

This is true of computer memory, and of computer disk and file storage, and of human memory, and of information stored on paper, and of every other way of storing information we know of.

**Important:** Caching creates memory that is big and is *usually* fast.

Caching pairs a small amount of fast memory with a large amount of slow memory. Whenever we access something in memory we first check the fast memory; if it's not there we copy it from the slow memory to the fast memory so that it will be there next time. Because the fast memory is small, putting something in it means evicting something else, preferably something we've not accessed in a while.

**Exercise:** The following will help you see how caching works in your own head.

1. Access some kind of stopwatch to accurately time things with. Do not move on to the next step until you have it ready.
2. Time yourself answering this question: What is the **sixth word** of the **second sentence** of the Wikipedia article on **Dennis Ritchie**?
3. Write down that time and reset the stopwatch.
4. Time yourself answering this question again: What is the **sixth word** of the **second sentence** of the Wikipedia article on **Dennis Ritchie**?
5. Write down that time as well.
6. How much faster were you on the second question than the first? Why?

# Locality

Caching works by having two memories: a large slow memory called "main memory" or "RAM" and a small fast memory called "the cache". (It can also have a hierarchy of caches: one very small very fast, another somewhat larger and slower, another larger and slower than it, and so on. In this case we call the smallest+fastest the L1 cache, the next one the L2, then L3, and so on.) All data is in main memory; some is also in the cache. Our goal is to keep all the data we're likely to use in cache, and to do that we need to have some idea what is likely to be used.

In theory, we could write code that accesses memory in a totally random and unpredictable way, but in most code people write, most memory accesses exhibit **locality**, which is generally understood to mean two things:

**Spatial Locality:** If you just accessed address x, you're likely going to access address x+1 next. More generally, accesses to nearby addresses tend to occur close together.

**Temporal locality:** If you just accessed address x, you're likely going to access address x again soon.

Because memory accesses tend to exhibit these kinds of locality, caches are built to make accesses with these kinds of locality fast. Because caches are built to make accesses with these kinds of locality fast, writing code that has more locality in how it accesses memory will make your code run faster.

## How to build a cache that uses temporal locality

When code accesses address `x` from main memory, copy the value at that address into the cache, replacing whatever value in the cache has gone the longest without being accessed.

## How to build a cache that uses spatial locality

When the code accesses address `x` from main memory, don't just load the data at address `x`: load a whole block of adjacent bytes that include `x`. For example, we might load 32-byte blocks by loading addresses `x` though `x+31`, though it's more common to use bitwise operations instead of addition in order to better align with how hardware works, for example, the 32 bytes with addresses `x&~0b11111` through `x|0b11111` inclusive.

Many caches also implement something called "prefetching" to guess what address you're likely to access next based on the pattern of addresses accessed recently. The simplest and most wide-spread version of this assumes that you move through memory from small- to large-address, and thus if you access block x you'll next access block x+1. More advanced but less common methods keep track of several consecutive accesses and look for patterns in them.

Cache-friendly code which exhibits good locality can depend on nuances that seem irrelevant like the order of loops or the order of fields in a `struct`; can involve odd-looking constructs like breaking a loop into several parts; and can benefit from hard-to-read code that uses tricks like storing several values in one field using bit masks. However, these tricks can result in code that runs several-fold faster than other code.

**Exercise:** Consider a 2D `n`×`n` array stored as an array of pointers to arrays, `double **a`. Both of the following functions compute the exact same value, but one runs much more quickly than the other for large `n`; which one and why?

```c
double loop1(double **a, size_t n) {
  double frobenius = 0;
  for(int i=0; i<n; i+=1)
    for(int j=0; j<n; j+=1)
      frobenius += a[i][j]*a[i][j];
  return sqrt(frobenius);
}
```

```c
double loop2(double **a, size_t n) {
  double frobenius = 0;
  for(int j=0; j<n; j+=1)
    for(int i=0; i<n; i+=1) 
      frobenius += a[i][j]*a[i][j];
  return sqrt(frobenius);
}
```

**Hint 1:** Consider the spatial locality of each loop.

**Hint 2:** `a[i][j]` and `a[i][j+1]` are 8 bytes apart; `a[i][j]` and `a[i+1][j]` are at least 8*n* bytes apart.

**Answer:** `loop1` is much faster because it exhibits good spatial locality. The innermost loop moves 8 bytes at a time, ensuring that many of the accesses are cache hits.

# Warming up the cache

When code accesses memory and fails to find the address being accessed in the cache, we call that a "cache miss." Cache misses can be categorized in several ways depending on the underlying cache design. One type of miss that applies to all cache designs is a miss that happens the first time a given region of memory is accessed; this is called a "cold miss."

The first time you run a program, everything it does will encounter cold misses, including even loading the code into the processor. Thus, the first run will tend to be noticeably slower than a second run immediately afterward.

When timing code it is common to "warm up the cache" by running the code once before timing it. If cold-cache runtime is wanted, it is possible to "flush the cache" by running some other process that accesses huge amounts of memory to fill the cache with rubbish.

# Caching everywhere

Caching is used all through computing. Memory hardware uses several caches: main memory with a cache which itself has a cache which has another cache, and so on. Some disks also use caches to speed up file accesses. Your web browser caches most web content you view on your computer's disk, avoiding network traffic when it thinks the disk copy is sufficient; and also caches the pages you are looking at right now in main memory to avoid accessing disk; and main memory itself has a cache system too. Many other programs do something similar: if there's a large amount of data but at any one time only a small part of it is "active" and the software is relatively mature (not an initial prototype), it is likely the software has its own built-in caching design.

Caches can have unexpected impacts, typically when the caching system decides to use a cached copy of something when the "real" version has been changed. Sometimes called a "stale copy", these behaviors generally occur only in well-defined situations as defined by the cache designers, but those definitions often surprise users or are difficult to work around. Detecting and resolving staleness and keeping the copies of the data in the various caches all in sync with one another is a complicated and evolving topic which we will not get into in this class.
