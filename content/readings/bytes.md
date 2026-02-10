---
title: Bits, Bytes, and Composite Values
author: Luther Tychonievich
---

# Bits

Most digital computers use something that has two distinguishable states.
That might be positive vs negative magnetic polarity,
or high vs low voltage,
or smooth vs rough optical surface,
or bright vs dark light,
or any number of other distinguishable pairs.

These two values can be compared via enumeration
to any 2-value set,
most commonly either {False, True}
or {0, 1}.

# Binary integers

A sequence of n values from a b-value set
has b^n possible values.
A convenient way to structure those values is using place-value numbers.
The numeric value of an element of the sequence (s_0, s_1, s_2, ...)
is s_0b^0 + s_1 b^1 + s_2 b^2 + ....
You've likely been using this model with the set {0, 1, 2, 3, 4, 5, 6, 7, 8, 9}
(which has b=10) since you were a child: it's currently the dominant number system in almost every nation worldwide.

Computers have ready access to a set of bits, which can be treated as meaning {0, 1},
and thus place-value numbers with b=2 are dominant in computers.
Everything you know about base-ten "decimal" numbers also applies to base-two "binary" numbers
provided you replace any part of the decimal algorithm that references ten with a reference to two instead.

It is unusual to call a binary digit a digit; usually it is called a "bit" instead.

Many programming languages allow binary numbers to be written as literals by preceding them with `0b`, as `0b101010100`.
This notation was mostly added to languages in the 2010s and is uncommon in older code.

# Base 16 and Base 256

Humans have difficulty making sense of long sequences of digits,
so we tend to group them.
For example, many decimal numbers are written with groups of 3 digits and some kind of separator between groups.
These groups have 10^3 possible values,
making the separated number a type of base-thousand place-value number
with digits 000 through 999.

For binary, groups of 3 digits form a base-8 "octal" number, and instead of writing those digits as 000 through 1111
we write them 0 through 7 instead.
Groups of 4 digits are more common, forming base-16 "hexadecimal" numbers,
where instead of writing 0000 through 1111 we use the digits {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, F}.^[Both upper- and lower-case hex digits are common; 1A = 1a]

Many programming languages allow octal numbers to be written as literals by preceding them with `0`, as `0524`;
this notation is confusing and `0o` is becoming more common in recent languages, as `0o524`.
Every programming language I've used allows hexadecimal numbers to be written as literals by preceding them with `0x`, as `0x154`;

Groups of 3 bits are often called "octal digits".
Groups of 4 bits are called either "hex digits" or "nibbles"^[no standard spelling; nybble, nyble, and nybl are all also used.],
with "hex digit" being more common when writing it down and "nibble" being more common when referring to it as part of data.

Computers find that it's uncommon to use values as small as a bit or even a nibble,
and usually handle groups of 8 bits, called "bytes" or "octets"^["octet" is more precise, but "byte" is far more common.].
The resulting base-256 number system has no standard name
and no common programming language literal syntax.

# Power-of-1024 Prefixes

Power-of-two numbers show up in many places in hardware and hardware-interfacing software.
It is worth learning the vocabulary used to express them.

Value | base-10 | Prefix | Pronounced
|:--|--:|:-:|--:|
2^10 | 1024 | Ki | Kilo
2^20 | 1,048,576 | Mi | Mega
2^30 | 1,073,741,824 | Gi | Giga
2^40 | 1,099,511,627,776 | Ti | Tera
2^50 | 1,125,899,906,842,624 | Pi | Peta
2^60 | 1,152,921,504,606,846,976 | Ei | Exa

In all cases above, the i is sometimes dropped to just say (e.g.) G instead of Gi.  The i clarifies that we mean powers of 2 like 1024, not powers of 10 like 1000.  G could mean either 2^30^ or 10^9^, numbers that differ by about 7%; which one is meant can only be guessed from context unless the clarifying i is present.

Most software developers I know have memorized the powers of two between 2^0^ and 2^10^.
This allows them to efficiently recognize and work with all powers of two using a trick to split larger powers into a prefix and a smaller power.
For example, 2^27 = 2^7 * 2^20 = 128M.  This pattern works for any power of 2: the 1's digit of the exponent becomes a number, the 10's digit becomes a prefix.  Thus

Value | Split | Written
|:--|:-:|--:|
2^27 | 2^7 * 2^20 | 128Mi
2^3  | 2^3 * 2^0  | 8
2^39 | 2^9 * 2^30 | 512Gi


# Composition through adjacency

## Arrays

Arrays are lists stored sequentially.
There are three common ways of indicating how many things are in an array.

Some arrays have a *static* length,
meaning you know how many elements are in it based on some external knowledge, not based on the stored data itself.
For example, the `int` datatype tells the compiler to look for lists of 32 bits (i.e. 4 bytes).

Some arrays have a stored *length*, meaning they are actually made of two parts:
one part is a number indicating the length of the other part, which is the actual array.

Some arrays have a *sentinel* value or values: something in the array
which indicates either "you've passed the end" or "this is the end".


## Multi-byte numbers and Endianness

Most numbers we use in programming,
including both `signed` and `unsigned` `short`, `int`, `long`, and `long long`, as well as `float` and `double`, have more bits than can fit in a single byte.
We break those bits into bytes and put them in adjacent spots in memory, but we have two orders we could do that in.

Big-endian numbers put the big end of the number (the most-significant place value) first, meaning at the smallest address.
This is similar to how decimal numbers are written in left-to-right languages like English
and is the order used in most network standards and protocols.

Little-endian numbers put the little end of the number (the least-significant place value) first, meaning at the smallest address.
This is similar to how decimal numbers are written in right-to-left languages like Arabic
and is the order used in most desktop and notebook computer hardware.

### Example 1
Suppose I store `int date = 20240118` in memory.
I'm running a little-endian computer so it will be stored in little-endian byte order.

An `int` needs 4 bytes, so let's store it in addresses `0xffff80` through `0xffff83`.
First we convert to hexadecimal (`20240118 == 0x134d6f6`),
then break it into bytes `01` `34` `d6` `f6`,
and then put those in memory little-end first

| Address | Value | Note |
|:-------:|:-----:|:-----|
| ffff80  | 0xf6  | lowest-order byte |
| ffff81  | 0xd6  |
| ffff82  | 0x34  |
| ffff83  | 0x01  | highest-order byte |

### Example 2
Suppose I store `short[3] date = {0x2024, 0x1, 0x18};` in memory.
I'm running a little-endian computer so it will be stored in little-endian byte order,
but the order of elements in an array is always the smallest index at the smallest address.

A `short` needs 2 bytes and there are three `shorts` in the array, so let's store it in addresses `0xffff80` through `0xffff85`.

| Address | Value | Notes |
|:-------:|:-----:|:------|
| ffff80  | 0x24  | Low-order byte of first value |
| ffff81  | 0x20  | High-order byte of first value |
| ffff82  | 0x01  | Low-order byte of second value |
| ffff83  | 0x00  | High-order byte of second value |
| ffff84  | 0x18  | Low-order byte of third value |
| ffff85  | 0x00  | High-order byte of third value |

### Example 3
Suppose I send `short[3] date = {0x2024, 0x1, 0x18};` over a network.
Networks assume big-endian byte order,
but the order of elements in an array is always the smallest index at the smallest address.

I would send the bytes in the following order:

1. 0x20
2. 0x24
3. 0x00
4. 0x01
5. 0x00
6. 0x18


# Composition with Pointers

Both memory (RAM) and files (disk) present themselves to us as an *array of bytes*.
In memory, we call these indices "addresses" or "pointers", as follows:

- The **address** of a byte in memory is the index of that byte in the array of bytes that is memory.^[We'll see later in the course that there are two different addresses, physical and virtual, but both fit this same definition.]

- A **pointer** is a value we intend to use as the address of something.

- The address of a **multi-byte value** comprised of multiple adjacent bytes is the address of its **first** byte, meaning the byte with the numerically-smallest address.

Pointers are themselves multibyte numbers, and hence stored with endianness.
The number of bytes per pointer is a fundamental design decision when making a new computer,
and is sometimes references when describing the processor itself;
for example, a 64-bit processor is one that stores 64-bit (8-byte) pointers^[Nuance: it is pointers, not addresses, that these numbers describe. I am writing this on a 64-bit computer, meaning it has 64-bit pointers. However, it has 48-bit addresses: the remaining 16 bits of the pointers are ignored by the processor.].

You've programmed with pointers extensively in previous classes, so we won't add much more about them here.

