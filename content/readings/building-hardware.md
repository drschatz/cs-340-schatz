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

