---
author: Luther Tychonievich
subtitle: Wallet
title: MP6
---
This Malicious Pthread (MP)'s goal is to have you experience working with synchronization primitives.
In particular, we expect you to use the mutex, reader-writer lock, and condition variable primitives provided by the pthreads library.

You are provided with a simple map implementation. You will extend it by adding a reader-writer lock to make the map thread-safe. Then, you'll implement a wallet extension that uses a condition variable for each entry in the map to ensure that account balances never become negative. If a withdrawal would cause a balance to go below zero, the operation should instead wait until sufficient funds become available.

# Initial Files

[`mp6.zip`](../mp6.zip) contains our implementation of a map,
along with test files.

You will modify and submit `wallet.c`, and possibly `wallet.h`.
You should not change any function signatures in `wallet.h`, but may change the `my_map` struct declaration.

The test files are provided in several parts:

- `tests/test_0_map.c` tests that the map still works (this passes in the starter files, your job is to not break it).
- `tests/test_1_rwlock.c` tests that the reader-writer lock you add functions.
- Other files in `tests/` test different aspects of the mutex and condition variable additions and wallet behavior.

Running one of these test files directly (for example as `make; tests/test_0_map`{.sh}) will show details about how the test is progressing.
`make test` runs the same thing as `python3 tests.py` and provides summary results about each test file,
along with your projected grade.

There's also a file `user_test.c` which is provided to make it simpler for you to write your own tests to explore what is going on with your code.

## Provided map

We provide a starting map, with a different set of interface functions than is commonly used in a data structures course.
We also provide a few extra functions that will be helpful for the second part of this MP.

We provide:

- `setdefault`, despite being more like `get` than it is like `set`, is "retrieve or insert", unconditionally succeeding and sometimes modifying the map's size. We provide this method.

- `assign` is "change or fail", changing the value of key only if the key is present and returning whether it succeeded. We provide this method.

You may add to this interface if you wish, but we think that the methods we provide are best suited for this MP.

You will add a reader-writer lock to the entire map
and a condition variable, mutex pair to each entry in the map.


# Machine Problem

You need to do the following:

- Make the map thread safe with productive parallelism:
    two threads should be able to access the map in parallel, not just in series. 

- Implement `wallet_use` such that
    if the requested change would make the value become negative
    then the calling thread is suspended until that is no longer the case.

## Make the map thread safe

A data structure is thread safe if multiple threads can access it concurrently without risk of corrupting the data structure and rendering it inoperable.

**This means that modification of the data structure's *internal* data (the arrays, pointers, and so on that make it work) is synchronized, but modification of the data the user puts inside it are not.**

Reader-writer locks are well suited to making thread-safe data structures because *most* operations do not require writer access.
For a map, a reader (also called "shared") lock is used for 

- Checking if a key is in the map.
- Retrieving the value at a key.
- Changing the value at an existing key.

A writer (also called "exclusive") lock is used for 

- Inserting a new key into the map.
- Removing a key from the map (but we won't need that for this MP).

Note that *retrieving* or *changing* a value requires the reader lock, but *inserting* a key requires the writer lock.
Because interfaces generally combine these (`set` both changes and inserts; `setdefault` both retrieves and inserts),
making them thread safe involves the following sequence of steps:

1. with the reader lock, if the key is present use its value;
2. otherwise, with the writer lock insert the key and value.

This is complicated by the fact that reader/writer locks don't let you "upgrade" a reader lock to a writer lock.
This means the process when the key is not present is roughly

1. get the reader lock
2. detect that the key is not present
3. release the reader lock
4. get the writer lock
5. insert\* the key and value
6. release the writer lock

\* Even this won't work in all cases, though, because while the thread is getting the writer lock another thread might have added the key, so we have to check if the key is present again with the writer lock:

4. get the writer lock
5. check if the key is present to decide whether to modify its value or insert it
6. release the writer lock

### Locking errors manifest in many ways. 
If you have an error in when/how you acquire and release locks, you might see:

- Deadlock: 0% CPU while all threads wait on other threads.

- Segfaults: the data structure is changed while another thread is working on it, leading the other thread to do something illegal.

- Corruption: the data structure is changed in inconsistent ways by two threads, resulting in a broken state which might cause arbitrary behavior.

This variety of errors is not because the MP is poorly designed nor because you are new to synchronization:
it is *fundamental* to writing code with synchronization primitives.

When working with synchronization, it is worth thinking carefully about such things as

- Where locks are acquired and where they are released.
- Ensuring there is no way to exit a function without releasing any acquired locks.
- Ensuring there is no way to modify data multiple threads can see without acquiring a lock.

### Verifying productive parallelism

The `time` command line tool (like the `times` system call it wraps)
reports three kinds of time used by a program:

- _real_ time is wall-clock time, how much later it was when the program ended than when it began.
- _user_ time is the sum of all thread's time spent running in user mode (i.e. running your code).
- _system_ time is the sum of all thread's time spent running in kernel mode (i.e. operating system functions).

If `time ./myprog` shows _real_ < _user_ time, then thread parallelism was achieved and beneficial to overall runtime.
If _real_ ≥ _user_, parallelism is either not achieved at all or not paying off compared to time spent waiting.

The provided tests use `times` to check if parallelism was achieved,
but you might find that using `time` is more informative.


## Implement `wallet_use`

The function call

```c
wallet_use(&my_map, key, delta);
```

should act like what other languages might represent as

```py
map[key] += delta
```

*except* it should never result any value in the map becoming negative.
Conceptually, we want the code to do

```
if map[key] + delta < 0:
    wait until map[key] + delta >= 0
map[key] += delta
```

Condition variables allow threads to wait for something to happen.
They are always paired with a mutex, which keeps things from changing while the thread is part-way through deciding whether to wait or not.
All threads using a given condition variable must use the same mutex,
but it is permissible for a single mutex to be used for multiple condition variables.

Using fewer synchronization primitives means lower start-up time and less memory usage, and less memory also meaning better cache performance and thus speed. Using more synchronization primitives means more precise synchronization and less wasted effort. Which to pick depends on context.

Given the common pattern of

    with mutex:
        while condition is false:
            wait on condition variable, releasing mutex while you wait
        change something
        notify others waiting on the condition variable that it has changed

we have three choices:

1 mutex and 1 condition variable
:   every thread wakes up and re-checks the condition variable every time anything changes.

1 mutex and many condition variables
:   only one thread at a time can be checking a condition or changing something, but we can be selective in which ones wake up.

many mutexes and condition variables
:   parallelism can occur in condition checks and changes, and we can be selective in which threads wake up.

`test_4_ring` require that if 500 threads are waiting on different values,
when one value is added most of the threads don't wake up.
That means you need many condition variables,
most simply one per entry in the map.

`test_5_crowds` requires that if 500 pairs of threads are waiting on one another,
more than one pair them can make progress in parallel.
The simplest way to do this is one mutex per condition variable,
though there nuanced ways of using shared mutexes that can do this too.


### Note
The address of a mutex and/or condition variable **must not change** while it is being used.
The usual way of guaranteeing this is to allocate each one with its own `malloc` invocation
and only ever store or pass the pointer, not the structure itself.

```c
phtread_mutex_t *whateverNameYouPick = malloc(sizeof(pthread_mutex_t));
pthread_mutex_init(whateverNameYouPick, NULL);
```



# Submission and Grading
Submit both `wallet.c` and `wallet.h` on Prairie Learn before the deadline. There is no autograder for this MP due to constraints of Prairie Learn. Your MP score should be what your MP scores locally on your computer (if this is not the case, please come talk to me).

The score created by `make test` is the score you get on this MP.

The "scores" shown by the various individual test files inside the `tests/` directory are intended to be informative and are not directly included as part of your grade for this MP.
