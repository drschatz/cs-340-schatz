---
title: Synchronization
author:
    - Luther Tychonievich
---

Synchronization manages the timing of concurrent operations,
typically by making one or more operations wait until some condition is met by another operation.


- Computers and most processes communicate through sockets or related message queues, providing a natural place to synchronize.

- Threads and some processes (those that communicate though a shared file or shared memory) can overwrite one another's work and require additional synchronization.

Synchronization of threads and shared-resource processes has been a topic of study in computer science at least since the 1960s,
and many strategies for synchronizing have been designed, implemented, and studied.

# Synchronization primitives

All synchronization primitives have the following property:

- They define rules under which some threads will **block** when running a function/method, being suspended by the OS until some other function/method on the same data in another thread unblocks it.

There are many synchronization primitives; the following are those I see the most often in code I read and write.

In C, the most common threading library is called pthreads.
All pthreads synchronization primitives should be **kept at a fixed, never-changing memory address**
for their entire lifespan
and passed to functions by pointer, not by value.
Some, but not all, implementations use the address of the primitive as part of the logic it implements.
The primitive must be initialized before use (with `pthread_`type`_init`)
and destroyed after use (with `pthread_`type`_destroy`).

### A brief description of useful synchronization primitives in the pthreads.h library

A **mutex** is single-user: once some thread `lock`s it, other threads will have to wait for the first thread to `unlock` it.
Relevant functions are `pthread_mutex_init`, `pthread_mutex_lock`, `pthread_mutex_unlock`, and `pthread_mutex_destroy`.

A **condition variable** must be paired with a *mutex* and lets code temporarily relinquish the mutex: `wait`ing on the condition vaiable both releases the mutex and causes the thread to wait until some other thread holding the mutex `notify`s or `broadcast`s waiting threads that they can try to `lock` it again.
Relevant functions are `pthread_cond_init`, `pthread_cond_wait`, `pthead_cond_broadcast`, `pthread_cond_signal`, and `pthread_cond_destroy`.

A **reader-writer lock** is like a *mutex* with two modes. The write mode acts like a regular *mutex*. The read mode lets any number of threads acquire it simultaneously; they all have to release it before it can be acquired in write mode.
Relevant functions are `pthread_rwlock_init`, `pthread_rwlock_rdlock`, `pthead_rwlock_wrlock`, `pthread_rwlock_unlock`, and `pthread_rwlock_destroy`.



## Mutex

A mutex has two states: locked and unlocked.
It also has two functions/methods: lock and unlock.
Lock changes the mutex from unlocked to locked, blocking until that can be done.
Unlock changes the mutex from locked to unlocked.

The most common use of mutex is to implement **mutual exclusion** -- it's even named after that concept.
Mutual exclusion creates a chunk of code (called a "critical section") that only one thread can access at a time.
This tends to look like

    pthread_mutex_lock(m);
    
    do things
    using only one thread
    at a time
    
    pthread_mutex_unlock(m);

It's very important to always unlock;
be wary of code that has a `return` or the line between the lock and unlock.

### Example
Bathroom stalls act like mutexes:
when you "lock" it (try to enter the stall)
you either get exclusive access to it until you "unlock" it (leave the stall)
or you block (wait) until it's available.

**aside** - Some other languages call mutexes "locks"
and/or use the verbs "acquire" and "release" instead of "lock" and "unlock".


## Condition Variable

A condition variable isn't a variable and doesn't check any conditions.
Rather, it is a tool used to support a particular type of synchronized checking of conditions.

Condition variables are always paired with mutexes.
Multiple condition variables may share a single mutex,
but trying to use a single condition variable with different mutexes can create problems.

A condition variable works with its mutex to create a special temporary-release mode.
The condition variable has wait, broadcast, and signal methods.

The `wait` method 

1. releases the lock;
2. blocks the calling thread;
3. once another thread `broadcast`s (or, in some cases, `signal`s),
    a. re-acquires the lock;
    b. unblocks and resumes execution.

The difference between broadcast and signal
is broadcast wakes up *all* threads that are waiting on the condition variable
while signal wakes up just *one* such thread, chosen arbitrarily.
When in doubt, we recommend broadcast over signal.

All three methods (wait, broadcast, and signal)
must be called from a thread that has locked the corresponding mutex.

The primary use of condition variables
is the following specific pattern
for waiting until some arbitrarily-complicated condition is met:

    pthread_mutex_lock(m);
    while (!complicated_condition_is_met()) {
        pthread_cond_wait(cv, m);
    }

    do things using only one thread at a time
    that change the complicated condition for some thread

    pthread_cond_broadcast(cv);
    pthread_mutex_unlock(m);


<details class="aside"><summary>Explaining the while loop</summary>

The code

    while (!complicated_condition_is_met()) {
        pthread_cond_wait(cv, m);
    }

might make more sense if we expand it out
with the things the wait does:

    lock the mutex
    repeat as long as the condition is not met:
        unlock the mutex
        wait for notification that something has changed
        lock the mutex
    
    ...
    
    unlock the mutex

In other words,

1. Checking the condition is serialized by the mutex
2. Waiting is not serialized; other threads can change things while we wait
3. When we exit the loop, the condition holds (and will keep holding until we change it or release the mutex)

</details>


### Example
I sometimes eat at a buffet where each dish has a condition variable-like interface.
Only one person can access a given dish at a time (making it like a mutex),
but if that dish is empty they can wait for it to be refilled.
Workers can also refill the dishes.

In other words, as a customer with a specific food I like I run this:

```c
pthread_mutex_lock(food_station.mutex);
while (!food_station.has_food()) {
    pthread_cond_wait(food_station.condvar, food_station.mutex);
}
food_station.serve(me);
pthread_mutex_unlock(food_station.mutex);
```

The worker who refills the food uses it more like a lock,
kicking off this process periodically as more food is cooked and ready to serve:

```c
pthread_mutex_lock(food_station.mutex);
food_station.refill();
pthread_cond_broadcast(food_station.condvar);
pthread_mutex_unlock(food_station.mutex);
```



**aside** - Because every condition variable needs a mutex,
some implementations of condition variables integrate the mutex into the condition variable object.

**aside** - One particular way of using a condition variable, called a **monitor**,
ties the various condition variable operations to changes in attribute values of an object,
creating one type of synchronized, thread-safe class.

## Reader-writer lock

A reader-writer lock can be acquired in two ways.
If acquired in "exclusive" or "write" mode, it acts just like a regular mutex.
If acquired in "shared" or "read" mode, any number of threads can acquire it simultaneously,
but all must release it before it can be acquired in exclusive/write mode.

\* when changing to unlocked, if there's a blocked thread let one of them unblock and acquire the lock.

Reader-writer locks often add some additional logic
to adjust the relative priority of readers and writers.

### Reader and writer priority
If there's a never-ending supply of readers
then the count will never reach zero
and the writers will never unblock.
This is called "write starvation".

If we change it so that rdlock blocks if any wrlock is blocked
we won't have write starvation,
but now how we pick what thread to unblock matters.
If we always unblock wrlocks first, readers will have to wait for writers
possibly leading to read starvation.
If we unblock first-come first-serve, readers might not get as much parallelism as we wish.
And so on:
there's no single best rule,
and different implementations make different choices to optimize for different use cases.


### Example
Museums operate a kind of reader-writer lock.
Visitors acquire the lock in shared mode when they arrive
and release it when they leave,
allowing any number of visitors to browse the exhibits at the same time.

```c
pthread_rwlock_rdlock(exhibit);
view_exhibit();
pthread_rwlock_unlock(exhibit);
```

The curator acquires the lock in exclusive mode to set up a new exhibit
and release it when the exhibit is ready,
ensuring that visitors can't get in the way of the exhibit installation.

```c
pthread_rwlock_wrlock(exhibit);
update_exhibit();
pthread_rwlock_unlock(exhibit);
```



