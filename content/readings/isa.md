---
title: ISAs and Assembly
author: Luther Tychonievich
---

Computer architecture is a field with many subareas, most of which are beyond the scope of this course.
One part of that field is of some importance to the average programmer:
the **Instruction Set Architecture**, or ISA.
ISAs are the interface design between hardware and software
and define the set of things that the programmer can ask the hardware to do.

From the software side, an ISA is a set of instructions
with two representations: machine code and assembly.
Machine code is a compact binary representation of the instructions,
assembly is a less-compact textual representation of the same information.
The process of converting assembly to machine code is called **assembling**
and is a fully **reversible** operation; that is, a disassembler can recover the original assembly from the machine code.
Because of this reversibility, the distinction between assembly and machine code is not very important in practice and it is fairly common to use the two terms informally as if they were synonyms.

**Compilation** is the process of converting programming language source code
into assembly and is in general a lossy, **irreversible** operation.
For example, both for-loops and while-loops are translated to the same assembly, making recovering the original construct from the assembly guess work at best.

There are multiple ISAs in common use today.
As of 2024, the two most prominent families of ISAs are
x86-64 (also called amd64) and ARM (which is a collection of several loosely-related ISAs; aarch64 is a popular one).
x86-64 is common in devices manufactured by Intel and AMD
for servers, workstations, desktops, and notebook computers
and has evolved in a backwards-compatible way since 1978.
ARM is common in devices manufactured by Qualcomm, Samsung, and Apple
for phones, embedded computing, and low-power portable computers.
NVidia, AMD, and Intel also make commonly-used ISAs for graphics processors, which are out of scope for this class.

# Key parts of an ISA

In principle, an ISA could be designed in many different ways,
but in practice CPU ISAs tend to have the same basic components.

## Operation and Operands

Each instruction is defined by an operation it performs
and typically a few operands.
Three forms of operand are common:

- *Immediate values* are numbers present in the instruction itself, like a literal value in a programming language.
- *Program registers* are few in number (typically 16 or 32) and used in most intermediate computation, like a local variable in a programming language.
- *Memory addresses* are used like they are in programming languages to access data structures and so on.

x86-64 tends to prefer two-operand instructions, like `x += y`.
ARM tends to prefer three-operand instructions, like `x = y + z`.
Both have assembly language syntaxes that put the operation first followed by a list of all operands, like `add x0, x1, x2`.

In machine code, the operation is encoded as an enumerated value often called an "icode."

## The Stack

Assembly tends to make heavy use of a stack data structure.
It's used to store activation records that manage calls and returns.
It's also used to temporarily store data that can't fit in the available program registers.
Many functions have the general structure

1. push several registers to the stack
2. do the work of the function using those registers
3. restore the old values of the registers by popping them from the stack

## Operation Types

Most instructions have one of the following operation types:

- *Load* a value from memory into a register.
- *Store* a value from a register into memory.
- *Compute* a value from other values, all in registers.
- *Jump* to a new location instead of continuing with the next instruction in memory.

Load and store instructions are sometimes collectively called "move" instructions.
x86-64 has instructions that combine a load or store with a compute; ARM does not.

Function calls are a combination of pushing (storing) the address to return to onto the stack
and then jumping to the address of the first instruction of the function.
Function returns are a combination of popping (loading) the address to return to from the stack and then jumping to that address.

## Conditional operation

Any instruction might be conditional,
checking some condition and only doing its operation if the condition is true.
Both x86-64 and ARM store conditions in a special register, often called the "flags" or "condition codes,"
updating them in (some) compute instructions
and checking them in subsequent conditional instructions.
This is is common to see instructions like "if negative, jump to address 0x1234"
with no explicit indication of what we are checking for negativity.

All ISAs have conditional jumps, as these are needed to implement programming language control constructs;
other conditional instructions are also commonly provided and used by compilers to optimize certain common code patterns.


# Example C-to-Instructions

The following intentionally do not use any real ISA,
but instead describe the kinds of operations that ISAs would use to implement the given code.

**Array indexing:**

C code:
```c
int *x;
// ...
x[y] = 4;
```

Assembly instructions:
```
// r0 = x, r1 = y
r2 = r1 * 4 // sizeof(int)
r2 += r0
store 4 in *r2
```

**If-else statement:**

C code:
```c
if (x > 0)
    // case 1
} else {
    // case 2
}
// case 3
```

Assembly instructions:
```
// r1 = x
    compare r1 - 0
    if not positive, jump to elseblock
    // case 1
    jump to endif
elseblock:
    // case 2
endif:
    // case 3
```

**For loop:**

C code:
```c
for(int i=0; i<n; i+=1) {
    // case 1
}
// case 2
```

Assembly instructions:
```
// r0 = i, r1 = n
    r0 = 0
loopstart:
    compare r0 - r1
    if not negative, jump to endloop
    // case 1
    add 1 to r0
    jump to loopstart
endloop:
    // case 2
```
You'll learn many more such translations in CS 421.
Key ideas to remember for now:

1. The C language is designed in part to make translating to assembly simple. It doesn't have any classes or other advanced features that involve significant assembly for a single line of code.
2. Assembly writes out each part of an instruction directly. Array access is computing an address and accessing memory. Control constructs compute conditions and jump to new program addresses.

# Interacting with Assembly

There are various reasons why you might be called on to interact with assembly.

- Debugging pre-compiled binaries.

    Compiled executable are typically delivered without source code
    but can be disassembled to assembly.
    This might be necessary if your code is interacting with third-party libraries in unexpected ways.
    Most debuggers will disassemble automatically;
    the command-line tool `objdump -d executableFile`{.sh} command will also output the assembly.

- Binary security exploits.

    Many security exploits work at the machine code level.
    Common security operations (both offense and defense) work above this level,
    but those working in security research often need to interact with assembly or even the specific bits of machine code.

- Performance tweaks.

    Compilers are very good at optimizing your code,
    but there's a big gap between "very good" and "perfect."
    If you really have to eke every cycle you can out of an application,
    you're likely to either implement part of it in assembly
    or implement it in C but then look at what assembly the compiler is generating.
    The `-S` flag, like `gcc -S myfile.c`{.sh}, will cause most compilers to output an assembly file instead of an executable.

- Operating system implementation

    ISAs have some instructions that only the operating system is allowed to execute
    and which are not generated by most compilers because of that.
    If you ever work on an operating system,
    or on a bare-metal project designed to run on an embedded system without an operating system,
    you are likely to put in a few lines of assembly to use those operating-system-only instructions.
