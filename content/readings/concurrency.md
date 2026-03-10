---
title: Concurrency
author:
    - Luther Tychonievich
---

Two things are concurrent if there exists a time when both have started and neither has concluded.
Two things are occurring in parallel if there exists a time when both are actively occurring.
Concurrent is a superset of parallel.

### Example
If I speak with a passenger in my car while driving to work, I am speaking and driving in parallel.

If I stop my car while on my way to work to talk to someone I pass on the sidewalk, then resume driving after the conversation, then I was speaking and driving to work concurrently but not in parallel.

Concurrency allows software design organized around multiple conceptual agents, each with its own tasks and workflow.
Parallelism adds runtime efficiency to concurrency, but does not otherwise expand the design space.

# Kinds of concurrency

Some parallelism is all-but invisible to the programmer,
being inserted by the compiler and/or hardware for better performance.
Hardware-inserted parallelism includes instruction-level parallelism, out-of-order execution, and speculative execution.
Compiler-inserted parallelism included vectorization and SIMD instructions.
These are topics that will not be further discussed in this class.

## Computers

The heaviest-weight concurrency is running on a separate physical computer.
Coordination of work requires an explicit message-passing protocol.

Computer systems designed to work across several computers are commonly called "distributed systems."


## Processes

A large step down from computers are processes.
A process runs its own code, accesses its own memory,
and generally acts like its own entity separate from other processes;
but it shares an operating system with other processes on the same computer.
This means that communication between processes is as simple as a system call,
speaking to the operating system which can then access a shared resource like a file or part of memory for the process.


## Threads

A thread has its own execution context -- the code it is running and values of local variables --
but shares memory with all the other threads in the same process.
The shared memory means coordination is easy, but so is accidentally messing up what other threads are trying to do.
This is especially true because threads run either in parallel or with preemptive scheduling,
both meaning that on thread 1 may change memory between any pair of thread 2's instructions,
or in some cases half-way through a single instruction executing.

Multithreaded programming is characterized by consciously choosing to limit behaviors that might interrupt other threads.

# Coding concurrency

## Multi-computer concurrency

Applications that involve multiple computers generally communicate using sockets and network connections.

## Multi-thread concurrency

There are several threading APIs, but the most common has a parent thread
spawn a child thread, giving it a function to execute;
once that function returns the child thread terminates.

### Spawning a thread in C
You'll need to `#include <pthread.h>` and include the `-pthread` option in your `gcc` or `clang` command line invocation.

```c
// assume we have a function defined with this signature:
// void *function_to_run(void *arg)

pthread_t tid;
void *argument = /* ... */
void *returnvalue;
pthread_create(&tid, NULL, function_to_run, argument);

// do one of the two following, but not both:
// pthread_detach(tid); // ignore the thread; OR
pthread_join(tid, &returnvalue); // wait for it to finish
```

Because threads share the same address space, they can easily communicate by setting and checking values in memory.
However, doing that can create **race conditions**.
In general a race condition is any time that the outcome of a program depends on the order in which different threads do different things.
A common version of a race condition has the following structure:

1. Thread 1 checks some value in memory to decide what to do.
2. Thread 2 changes that value.
3. Thread 1 does the thing that the old value wanted it to do but that is no longer correct because of the change thread 2 made.

### Example
Suppose two threads are both transferring money using logic like this:

```py {.numberLines}
if fromAccount > transferAmount:
    fromAccount -= transferAmount
    toAccount += transferAmount
else:
    showError("Insufficient funds")
```

Suppose `fromAccount` starts as 15 and both threads are transferring 10 from it.
If both threads run line 1, both will decide `15 > 10` and then both run line 2,
causing the `fromAccount` to go to -5.

Avoiding race conditions generally requires some form of synchronization between threads,
where one thread waits for another to finish some task before beginning some other task.

