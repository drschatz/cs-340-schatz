---
title: Kernel mode
author: Luther Tychonievich
---

Your computer has at least two modes of operation:
**user mode** and **kernel mode**.
All the code you have ever written
-- and, for most of you, all the code you will ever write in the rest of your programming career --
runs in user mode.

There are some things that user mode code cannot do on its own, including:

- Change or do something that another process could notice: write files, send network packets, change the color of pixels on the screen, etc.
- Observe something that another process could have done: read files, receive network packets, checking the color of pixels on the screen, etc.
- Observe something that the user did, like key presses, mouse motions, inserting or removing USB devices, etc.
- Claim or release system resources like memory or processor time.

While you cannot directly write code to do these things, you can still do them using special function-like operations known as **system calls**.
A system call will pause your code, jump to kernel code in kernel mode, and let the kernel decide what to do from there.
The kernel code, which is delivered as a key part of an **operating system**, has three common strategies it might follow:

- Do the thing you wanted it to do and then resume your code.
- Put your paused code in storage and run some other program for a while before resuming your code.
- Tell your code something went wrong by sending it a "signal"

# System calls: explicit requests to the kernel

**Q**: How do you write data to a file or the terminal?\
**A**: By calling a function like `printf` or `fwrite`.

<div><br></div>

**Q**: How do those functions work?\
**A**: By doing some up-front work which you could code yourself if you wanted, and then calling `write`.

<div><br></div>

**Q**: How does `write` work?\
**A**: By using a special assembly instruction called a System Call which freezes your code, switches to kernel mode, and lets the kernel code decide what to do based on the values your code left in registers before it used that instruction.

<div><br></div>

Each operating system has its own set of system calls.
Each ISA has its own system call instruction.
To help make code you write not depend too much on those details,
the C standard library includes a set of thin wrapper functions around these system calls
like `open`, `read`,
`write`, and `close` for working with files
or `sbrk` for adjusting how much heap memory your code has access to.
Unless you are porting C to a new operating system or hardware,
you can treat these functions as being system calls themselves.


# Invisible context switches

Sometimes your code switches into kernel mode without your asking it to do so.
Common reasons include:

- Your code did something unusual or wrong, like accessing memory that hasn't been allocated yet or dividing by 0. These are called "faults."
- Something outside your code happened, like a key being pressed or a timer expiring. These are called "interrupts."

In general, faults and interrupts will be handled without your code even knowing they happened.
They might result in a "context switch" meaning your code will be paused and another program run for a while before your code is resumed.
They might result in new resources being allocated or other kernel-managed modifications of the system to meet your request.
They might result in data becoming available to a blocked file descriptor and the blocked code unblocking.
And in some cases they might result in the kernel passing a failure back to user code using a signal.

A common kind of fault is called a "page fault" and occurs when your program accesses a page of memory that it hasn't accessed before.
This is a key part of how operating systems control how much memory each application receives.

It is common for operating systems to set up a timer that interrupts your code at least 100 times per second so they can check if there are other programs that should run instead and do other bookkeeping.

