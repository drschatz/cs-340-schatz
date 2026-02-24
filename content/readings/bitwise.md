---
title: Bitwise Operations
author: Luther Tychonievich
---

# Bitwise Boolean operators

Every programming language you're likely to encounter has a set of **bitwise** Boolean operators that can be combined to perform various tasks. These treat the integer datatype in the language in question as an array or list of bits called a **bitvector** and allow you to manipulate them directly.

|Operator | Meaning                   | Example                                                   |
|:-------:|:--------------------------|:---------------------------------------------------------|
|`~`      | Bitwise not     |  `~` 1100 → 1…1110011 |
|&#124;    | Bitwise or       | 1100 &#124; 0110 → 1110 <br/>(i.e., (12 &#124; 6) == 14)|
|`&`      | Bitwise and     | 1100 `&` 0110 → 0100<br/>(i.e., (12 `&` 6) == 4)|
|`^`      | Bitwise xor         | 1100 `^` 0110 → 1010<br/>(i.e., (12 `^` 6) == 10)|
|`>>`     | Bit shift to the right    | 1101001 `>>` 3 → 1101<br/>(i.e., (105 >> 3) == 13)|
|`<<`     | Bit shift to the left     | 1101 `<<` 3 → 1101000<br/>(i.e., (13 << 3) == 104)|

When shifting, bits that no longer fit within the number are dropped and new bits are added to keep the number the same number of bits. For left shifts those new bits are always 0s. For right shifts they are sometimes 0s and sometimes copies of whatever bit had been in the highest-order spot before the shift. Copying the high-order bit is called "sign-extending" because it keeps negative numbers negative in two's-complement. Which kind of right-shift is performed varies by language and by datatype shifted, with sign-extending shifts for signed integer types and zero-extending shifts for unsigned integer types.

**Example:** The following code makes use of C's sign- and zero-extension rules.

```c
// char is an 8-bit integer datatype
signed char x =    0b10100101;
unsigned char y =  0b10100101;
assert((x>>2) == 0b11101001);
assert((y>>2) == 0b00101001);

// short is a 16-bit integer datatype
signed short z =           0b10100101;
assert((z>>2) == 0b0000000000101001);
```

# Masks

A bit mask or simply **mask** is a value used to select a set of bits from another value. Typically, these have a sequential set of bits set to 1 while all others are 0, and are used with an `&` to select particular bits out of a value.

Bit mask constants are generally written in hexadecimal; for example, `0x3ffe0` (or 0011 1111 1111 1110 0000~2~) selects 13 bits, the 5th-least-significant through the 17th.

Bit mask computed values are generally built using shifts and negations; for example, `((~0)<<5) ^ ((~0)<<14)` generates `0x3fe0`:

Expression | binary | description | alternative constructions
-----------|-------:|-------------|---------------------------
`0` | ...`00000000000000000` | all zeros |
`~0` | ...`11111111111111111` | all ones | `-1`
`(~0)<<5` | ...`11111111111100000` | ones with 5 zeros in the bottom place | `~((1<<5)-1)`
`(~0)<<14` | ...`11100000000000000` | ones with 14 zeros in the bottom place | `~((1<<14)-1)`
`((~0)<<5) ^ ((~0)<<14)` | ...`00011111111100000` | 9 ones, 5 places from bottom | `((1<<9)-1)<<5`, `(~((~0)<<9))<<5`

# Bit terminology

When discussing a sequence of bits, some terms are used in multiple ways:

### Bit Vector
   A common name for a fixed-length sequence of bits, implemented using one of a programming language's built-in integer types, manipulated primarily by bitwise operations. Also a name for a more complicated data structure that stores any number of one-bit values.

### Clear
   As a verb, either replace a single bit with 0 or replace all bits with 0. To clear the 4th bit of `x`, you'd do `x &= ~(1<<4)`. To clear `x`, you'd do `x &= 0`. As a noun, "is zero", usually of a specific bit. To check if the 4th bit of `x` is clear you'd do `(x & (1<<4)) == 0`.

### ith bit
  Usually the bit which, in a numeric interpretation, would be in the 2^*i*^s place (i.e., the 3rd bit is in the 8s place): in other words, counting from least- to most-significant starting at 0. A number with just the `k`th bit a 1 can be created as `1<<k`. Unless otherwise specified, this is the usage of bit ordinals throughout this text. 
  
  Sometimes starts counting from the most- instead of least-significant bit.
  
  Sometimes counts from 1 instead of 0.
  
  Sometimes people use "th" for all 0-based bit counting (e.g., "the 1th bit" instead of "the 1st bit")

### Set
Sometimes a verb, "set this bit", meaning make it a 1. To set the 4th bit of `x`, you'd do `x |= 1<<4`.

Sometimes an adjective, meaning a bit position containing a 1. Thus in the number 1100110~2~ the 2nd bit is set but the 3rd is not.

### Zero
Sometimes the opposite of 1 as related to a single bit.

Sometimes a bit vector of all 0 bits.

Sometimes a synonym for "clear". The verb form is also sometimes rendered "zero out".

