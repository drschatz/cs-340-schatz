---
title: Virtual Memory
author: Luther Tychonievich
---

# Pretend I'm alone

When you wrote your first program, it used memory.
The same physical memory chip that all the other programs on your computer used.
Yet the instructor never said "now be careful, if you pick the wrong address you might mess up other programs."

Why not?

Because you can't access physical memory.

No, really, you *can't*.
You access some made-up thing called "virtual memory" instead.

The hardware implementation of memory accesses inside your processor
wraps every memory access in a special data structure so that the addresses your code uses
and the addresses that make it to the memory system
are not the same.
You write in **virtual addresses**; the memory system uses **physical addresses**;
and the hardware (with a tiny help from the operating system) uses **address translation** on *every access* to convert between these.

With rare exceptions, each program you write has its own entire set of virtual addresses,
called a "virtual address space."
I can ask you to write `hello_world.c` with no fear at all that you'll accidentally clobber the memory of your web browser or editor
because those application's memory lie in entirely different spaces.
For every address you can possibly write in `hello_world.c`, from 0x000000000000 to 0XFFFFFFFFFFFF,
not a single one will change anything in those other applications.

Your programs act like they are alone, the only application being run.

# Hide the hardware

You can write programs that use memory without ever asking "how much memory does the computer I'm running on have?"
This freedom is also enabled by virtual memory:
it (mostly) pretends you have all the memory you need.
If you access more total memory than there is available in the memory system
it will try to pretend you have more memory than you do by treating main memory like a [cache](cache.html) for a special part of the disk called "swap space".
Because disks tend to be at least a thousand times slower than main memory, this can cause a very substantial performance penalty, but it can let some programs run that otherwise would crash.

# Address translation

Address translation, they key operation of the virtual memory system, works in several steps.
The goal of these steps is to rapidly and in hardware

1. Maintain a mapping between virtual and physical addresses, `map<virtal_address, physical_addres> vm`{.cpp}.
2. With every memory access, use `memory[vm[address]]`{.cpp}, not `memory[address]`{.cpp}.

This is accomplished as follows:

## Pages

Memory is broken into conceptual "pages", commonly though not always 4KiB in size.
Addresses are broken into two parts:
the low-order bits describe which byte of a page we are looking at and are called the "page offset";
the high-order bits describe which page we are looking at and are called the "page number".


We only translate the page number, not the page offset.
This reduces the work we need to do,
guarantees that spatial locality will be preserved across address translation,
and allows for better integration with the cache system.


## Sparse arrays

The virtual page number to physical page number conversion is implemented using a data structure for storing sparse arrays called a "multi-level page table".

This data structure has a tree-like shape.
Each node in the tree is quite large.
The tree also has a fixed height: every leaf node is exactly the same number of steps from the root.
Keys in this tree are integers -- initially a virtual page number.
Each step down the tree we use the high-order bits of the integer
to pick which child to go to, removing those bits.
When we get to the leaf the remaining bits are the index of the value within the leaf.

### example
Suppose we have 256 entries per node in the tree,
the tree has 3 steps from root to leaf,
and we're using the 32-bit key 0x12345678.

We start at the root node and use the high-order 8 bits of the key (0x12) to pick one of its children.

From that child we use the next 8 bits (0x34) to pick one of its children.

From that child we use the next 8 bits (0x56) to pick one of its children.

We're now at the leaf, so the remaining bits (0x78) pick a value out of the leaf node.


The details of this structure are rarely important, but there are a few ideas worth understanding:

1. It's a tree, meaning it starts with a single pointer to the root.
    Changing this pointer changes the entire tree.
    The pointer is stored in a special register in the processor
    which only the operating system may change.

2. It's stored in physical memory with big nodes sized to fit one node per page.
    Thus the entire address translation system fits within its own rules:
    memory in pages, accessed at the page level.

3. The data structure is sparse: until you use a page, it isn't allocated to you.

4. Memory is allocated at the page granularity by the hardware and operating system.
    Using 1 byte or 4Ki bytes uses the same amount of system resources.


# Pages and Segments

It is the operating system's job to decide what physical address to map to each virtual address in each process.
Operating systems generally do this in a three-step process.

In advance, they pick **segments** of memory that your process may use.
They pick a range of addresses for the stack, a range of addresses for the heap, and so on.
These segments help safeguard against run-away programs that would otherwise hog all the memory on the system.

As part of loading your program, they initialize the virtual memory mapping and memory contents of some of your program's memory, such as the page of instructions where the program will start executing and the `main` function's stack frame.

Whenever your code accesses an address that does not yet have a page,
the hardware alerts the operating system.
The operating system checks the address against its list of segments;
if the address is in a segment that it's decided your application may access, it adds a mapping for that address's page to the virtual memory system and resumes your program's operation.
If not, it sends your application a "segmentation violation" signal (often called a segfault) instead
which generally crashes your program.

Depending on your system's memory setup, it may also be possible to find an address that the virtual memory system can't handle,
such as one that has more significant bits than the multi-level page table knows what to do with.
In that case it doesn't matter what the operating system's segments say:
the address cannot be used and you get a "bus error" instead (named after the "memory bus", one piece of the memory system hardware).

