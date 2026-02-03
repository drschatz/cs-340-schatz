---
title: Bits and Binary
author: Luther Tychonievich and Jule Schatz
---

Claude Shannon founded the field of information theory. A core fact in information theory is that there is a basic unit of information, called a "bit" (a portmanteau of "binary digit") or a "bit of entropy." Roughly speaking, a "bit" is an amount of information that is about as surprising as the result of a single coin flip. In the phrase "thank you" the word "you" has less than a bit of entropy; most of the time someone says "thank" the next word they say is "you," so adding that word provides very little more information. On the other hand, the word that comes after "is" in "Hello, my name is" has many bits of entropy; no matter what the word is, it was quite surprising.

**Exercise:** Claude Shannon performed an experiment to determine the bits of entropy of the average letter in English. You can perform a similar experiment to measure the bits of entropy of a human language of your choice.

1. Find a large corpus of example text (the larger the better)
2. Write a program that repeatedly:
   1. selects a random substring from the corpus, long enough to give a little context (perhaps 50 characters)
   2. prompt the user to type what the next character will be
   3. track the number of correct and incorrect guesses

After guessing correctly on *r* out of *g* total tries, an estimate of the bits of entropy per character in the corpus is log₂(*g* ÷ *r*).

Not all languages have the same information per character. Shannon suggested English had roughly 1 bit per letter (Shannon, Claude E. (1950), "Prediction and Entropy of Printed English", *Bell Systems Technical Journal* (3) pp. 50-64), while languages that use ideograms have many more.

It is likely that bits per second of speaking is more constant across languages, which could probably be tested by measuring the bits per character of subtitles and combining it with the timing information the subtitles contain, but I am unaware of any published effort to do this or any related measurement.

# Digital Information

How much information can we transmit over a wire? If we put voltage on one end, because wire conducts well we'll very soon see the same voltage at the other end. The more precise our measurement of that voltage, the more information we can collect. If we can distinguish between 1000 voltage levels, for example, we'll get log₂(1000) ≈ 10 bits of information per measurement; whereas a less sensitive voltmeter that can only distinguish between two voltage levels gets only log₂(2) = 1 bit per reading. This seems to suggest that the more precise I can make the voltage generator and the more sensitive the voltmeter, the more information I can transmit per reading.

The problem with this assumption is that it takes longer to transmit higher-resolution data. This is partly a consequence of fundamental mathematical and physical laws, like the Heisenberg uncertainty principle, but it is also more tellingly a consequence of living in a noisy world. To tell the difference between 8.35 and 8.34 volts, you need to ensure that the impact of wire quality and the environment through which it passes contributes significantly less than 0.01 voltage error to the measurement; generally this requires watching the line for long enough to see what is the noisy variation and what is the true signal. By contrast, telling the difference between 10 volts and 0 volts is much simpler and much more robust against noise. It is quite possible to make several dozen good 1-bit measurements in the time it'd take to make one 10-bit measurement.

This observation led to advances in digital signals: signals composed of many simple "digits" ("Digit" comes from a Latin word meaning "finger" and, prior to the computer age, was used to refer to the ten basic numerals 0 through 9. "Digital" meaning "a signal categorized into one of a few distinct states" became common in the 1960s, though it was used by computing pioneers as early as the late 1930s) instead of one fine-grained "analog" ("Analog" or "Analogue" outside the USA comes from a word meaning "similar to" or "alongside", suggesting that an analog signal has some direct correlation to the thing it represents) signal. We can communicate much more information with much less error by transmitting many single-bit signals than we can by transmitting a smaller number of signals with more information in each.

# Saying Anything with Bits

Information theory asserts that any information can be presented in any format that contains enough bits. There are many interesting theorems and algorithms about how this can best be done, but for most of computing we only need to consider a handful of simple encodings, described in the subsections below.

## Place-value numbers

### Base-10, "decimal"

When you were still a small child you were taught a place-value based numbering system. Likely at that age you never considered why we called it "place-value," but the name is intended to suggest that the value of each digit depends not only on the digit itself, but also on its placement within the string of digits. Thus in the number string `314109`, the first `1`'s value is a hundred times larger than the second `1`'s value. If we write out the full place values:

| 10⁵ | 10⁴ | 10³ | 10² | 10¹ | 10⁰ |
|-----|-----|-----|-----|-----|-----|
| 3   | 1   | 4   | 1   | 0   | 9   |

we can see that the number's total value is 3 × 10⁵ + 10⁴ + 4 × 10³ + 10² + 9 × 10⁰ or three hundred fourteen thousand one hundred nine.

### Base-2, "binary"

There is no particular magic to the 10s in the decimal example above. Because it is easier to distinguish two things than ten, we might reasonably try to use 2s instead of 10s. Instead of the ten digits 0 through 9 we use the two digits 0 through 1. Thus in the base-2 number string `110101` the first `1`'s value is thirty-two times larger than the last `1`'s value. If we write out the full place values:

| 2⁵ | 2⁴ | 2³ | 2² | 2¹ | 2⁰ |
|----|----|----|----|----|-----|
| 1  | 1  | 0  | 1  | 0  | 1   |

we can see that the number's total value is 2⁵ + 2⁴ + 2² + 2⁰ or fifty-three.

Base-2 numbers of this sort are widely used to convert sequences of single-bit data into a larger many-bit datum. Indeed, we call a binary digit a "bit," the same word information theory uses to describe the fundamental unit of information, and often refer to any single-bit signal as being a `1` or `0` even if it is more accurately a high or low voltage, the presence or absence of light in a fiber, a smooth or pitted region on an optical disc, or any of the wide range of other physical signals.

Math works the same in base-2 as it does in base-10 except it is two, not ten, that causes a carry digit:

```
            1      11      11    1 11    1 11
  1011    1011    1011    1011    1011    1011
+ 1001  + 1001  + 1001  + 1001  + 1001  + 1001
------  ------  ------  ------  ------  ------
             0      00     100    0100   10100
```

Binary is useful for hardware because it takes less space and power to distinguish between two voltage states (high and low) than between three or more. However, for most uses we find it more useful to cluster groups of bits together, typically either in 4-bit clusters called "nibbles" or "nybbles" or in 8-bit clusters called "bytes" or "octets."

