---
title: Building with Hardware
author: Luther Tychonievich
---

By attaching gates' outputs to the inputs of other gates, we can build more complicated operations. Such connected gates are commonly called "logic."

# Arithmetic

Binary arithmetic is just a complicated sequence of Boolean expressions. To see this, let's consider building the expression for a binary adder.

Suppose we have two binary numbers we wish to add, using only basic logical operations. Each number is represented by a sequence of bits; x₀ is the 1s place of number x, x₁ is the 2s place, x₂ is the 4s place, x₃ is the 8s place, and so on; similarly with y. We want to arrange a set of individual Boolean operations to compute all of the bits of z, where z = x + y.

We'll proceed the same way we would by hand: with the least-significant digit first and a carry bit if the sum in one place is larger than 1. To be sure we catch all cases, let's enumerate all four possible combinations of x₀ and y₀ and what the z₀ and carry should be in each case.

| x₀ | y₀ | z₀ | carry₁ |
|----|----|----|--------|
| 0  | 0  | 0  | 0      |
| 0  | 1  | 1  | 0      |
| 1  | 0  | 1  | 0      |
| 1  | 1  | 0  | 1      |

Notice that the z₀ column looks just like the XOR operation; and that the carry₁ column looks just like the AND operation. Thus we can configure the following:

```c
z0 = x0 ^ y0
c1 = x0 & y0
```

Now for z₁. This is the sum of x₁, y₁, and the carry we just computed. Again for completeness, let's enumerate all 8 combinations possible for these three inputs:

| c₁ | x₁ | y₁ | z₁ | carry₂ |
|----|----|----|----|--------|
| 0  | 0  | 0  | 0  | 0      |
| 0  | 0  | 1  | 1  | 0      |
| 0  | 1  | 0  | 1  | 0      |
| 0  | 1  | 1  | 0  | 1      |
| 1  | 0  | 0  | 1  | 0      |
| 1  | 0  | 1  | 0  | 1      |
| 1  | 1  | 0  | 0  | 1      |
| 1  | 1  | 1  | 1  | 1      |

Notice that the z₁ column looks like the three-argument XOR operation and that the carry₂ column looks like "at least two of these three bits are set," which can be stated in terms of AND and OR operations as `(x1 & y1) | (c1 & (x1 ^ y1))`.

```c
z1 = c1 ^ x1 ^ y1
c2 = (x1 & y1) | (c1 & (x1 ^ y1))
```

Every other digit behaves the same way:

```c
z2 = c2 ^ x2 ^ y2
c3 = (x2 & y2) | (c2 & (x2 ^ y2))
z3 = c3 ^ x3 ^ y3
c4 = (x3 & y3) | (c3 & (x3 ^ y3))
z4 = c4 ^ x4 ^ y4
c5 = (x4 & y4) | (c4 & (x4 ^ y4))
...
```

Thus, we can wire together a bunch of AND, OR, and XOR gates to create an "adder."

There's nothing special about an adder; with enough gates we can make anything you could write as a single expression of arithmetic and logic operations.

# Multiplexer

A multiplexer works like an array indexing operation. We have n data inputs, 1 data output, and 1 selection input that is a number between 0 and n-1.

The simplest multiplexer has 2 data inputs and a 1-bit selection input. It could be implemented as:

```c
out = (selection * in1) + ((1-selection) * in0)
```

Real implementations use fewer gates than multiplication, but the net result is the same.

A 2n-input multiplexer can be made out of two n-input multiplexers with their output multiplexed by a 2-input multiplexer. This is one of several reasons why powers of two are common in hardware: circuitry that can pick one of 5 options is no simpler than circuitry that can pick one of 8.

The 2-input multiplexer is also an operator in most programming languages. It has 3 inputs (2 data, one selection), meaning it's a ternary operator; and as it's the only ternary operator in most languages it is often called simply "the ternary operator." In most languages it is written as follows:

```c
out = selection ? in1 : in2;
```

though in Python it is instead:

```python
out = in1 if selection else in2
```

Its behavior is similar to an if-statement, except it is an expression not a statement.

# Register

Storing information is an important part of building a processor. The fastest and most important storage technique is called a register and is made out of several gates linked up in specific ways with their outputs feeding into each others' inputs. That feedback wiring creates little loops that store information; typically one of those loops is also used as an output so a register is always outputting the value it is storing. Registers typically have two inputs: a data input which supplies a new value to store and a control input which decides if the data input should be stored or ignored.

A common register hardware design is the D flip-flop (understanding the operation of D flip-flops is not important for this course, but [falstad.com](http://www.falstad.com/circuit/e-edgedff.html) has an interactive demo you can try if you are interested), also called the positive-edge-triggered D-style flip-flop, which can be made out of six NAND gates. This register uses a "clock" as its control input which allows a single instant in time to be used as the moment when the register stores its input.

Registers are the only part of common computers where information flow between gates is cyclical. As such they are often excluded from the generic "logic" term.

# Memory

The operation of memory is I give it an address and it gives back the data stored at that address. We could implement that using a register for each value in memory and a multiplexer to pick out the value at the given address.

That design doesn't scale well to the billions-of-bytes memories we use; registers take up too much space and need too much power. Various cheaper but slower designs are used instead that have the same behavior at lower cost.

# Processor design

## Conceptual design

Processors store instructions (think "line of code") in memory. Instructions generally are read and executed one after another, which we can implement by having a special register (called the "program counter" or "PC") which stores the address of the next instruction to execute. We send that to memory to fetch the next instruction `instruction = memory[PC]`. We wire the output of the PC to an adder and its input to implement `PC = PC + 1` and move through all the instructions.

Common instructions perform operations on the hardware equivalent of local variables, called "program registers." Like memory, these are an array of stored values; unlike memory, they are few in number and made out of actual registers so they are very fast to access. If you had `x = y + z` in your source code, the corresponding instruction might be `register[0] = register[1] + register[2]`: in other words, we used numbers instead of names for variables. The specific operation is done by picking one of several operation circuits using a multiplexer; thus the operation `+` is also encoded as an integer. This means the entire instruction is just four integers: 3 registers and one operation. Other operations like memory access or unary operations might have a different set of components, but we can always turn them into simple numbers.

Code also contains control constructs: if statements, loops, function calls, and so on. All of these change what code is executed next, meaning they all set `PC = something`. If they do so conditionally, that just adds a multiplexer, `PC = condition ? address1 : address0`.

## Modern design

While fully-functional computers can be built on the simple design outlined above, modern computers have many more complexities that help them run more quickly and with less power than a simple design would. A few example complexities are noted below.

1. **Fancy instruction encoding.** The set of instructions a computer can handle tends to change with every new release of the computer. But we don't want to have to change all our compiled code every time. Thus, instruction encoding tend to have deprecated instructions that are converted to a different set of internal instructions inside the processor and late-add instructions that violate the pattern established by the early instructions, making the instruction encoding confusing and not necessarily aligned with what the processor actually does.

2. **Pipelining.** Pipelining is the processor version of an assembly line: single instructions are broken into multiple steps and passed from one part of the processor to another, each doing just one step. Division requires non-trivial work for each bit of the answer, so instead of making one big circuit for all of it we make a first-bit circuit that hands its work off to the second-bit circuit and so on. 64 steps later we've got the result. But when that result arrives we might have 63 other divisions in the pipeline in various stages of completion. As of 2024, it is common to have *every* instruction go through a 5-15 stage pipeline and a few difficult ones like division add a few dozen more steps too. This means the normal case is that the processor is working on a dozen instructions at the same time.

3. **Speculation.** Pipelining has a problem that assembly lines do not: interdependence of instructions. If I work on an assembly line adding steering wheels to cars I never have to wait for one car to finish to know which steering wheel to put on the next car. But if I work in a processor doing multiplication I may well have to wait for a previous instruction to finish to know what values I'm multiplying together. To avoid sitting idle, processors try to guess or speculate what the outcome of something they are waiting on might be and perform the operation with that guess in advance. If they guessed right, everything goes faster. If they guessed wrong, simply discard the guessed work and start over with the correct value.

4. **Out-of-order execution.** Sometimes the way code is written isn't the fastest way to run it. Reordering instructions might let the processor start on a later instruction while it's waiting for an earlier one to be ready. To facilitate this kind of optimization, processors convert the instructions we provide with their register numbers and so on into an information flow dependency graph structure by adding hundreds of new internal register numbers, each one only modified by one instruction. These instructions are then dispatched to multiple internal queues, with division instructions waiting on the division logic while memory read instructions wait on a separate memory read logic. Out-of-order execution dramatically increases the value of speculation; it is not uncommon to have a hundred instructions in various states of partial completion, more than half of which are speculatively executed and might be discarded if the speculation proves to be incorrect.

One analogy to understand all of these complexities is to think of a processor like a company. A simple processor is like a single-employee company where that one person does each task in the simplest, most direct way. A modern processor is like a thousand-employee company with managers and inboxes and reports and departments. The work is the same in both, but the process is quite different and the amount of work that can be completed per day is much higher in the more complicated system.
