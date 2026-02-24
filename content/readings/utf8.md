---
title: UTF-8
author: Luther Tychonievich
---

UTF-8 is a character encoding that utilized several core bit- and byte-level design decisions. It can be thought of in several ways; one way is

1. A very large enumeration called Unicode which says things like "65 is a capital letter A" and "128026 is a spiral shell."
2. A way of breaking the bits of a value into 1--4 groups, all but the highest-order group having 6 bits and the highest-order group having different rules depending on the number of groups overall.
3. A way of padding those bit groups into bytes that has several useful properties:
	- It's obvious in a byte stream which bytes are the start of UTF-8 characters and which are not.
	- When reading a sequence of UTF-8 characters front-to-back, only 1 byte per character needs to be read to find the *n*th character.
	- Sorting strings of UTF-8 bytes gives the same order as sorting lists of Unicode enumeration values.

# Unicode

Unicode is an international standard that is best known for its mapping between characters and non-negative integers called "code points." Code points are most often written with `U+` followed by an upper-case hexadecimal representation of the integer zero-padded to at least 4 bytes; thus capital A is U+0041 (code point 0x41) and spiral shell is U+1F41A (code point 0x1F41A). Unicode supports code points between U+0000 and U+10FFFF, though most of those are currently unassigned^[As of Janaury 2024, fewer than 4% of code points had assigned meanings.].

The Unicode standard is more complicated than just a mapping between code points and glyphs. Each character is categorized in multiple ways, such as U+0041 being an upper-case letter where the lower-case pair is U+0061. Some code points encode metadirectives like "advance to the next tab stop" or "switch writing direction". Some code points adjust other characters, adding accent marks or changing the coloration of an emoji. Some glyphs can be created in multiple ways, leading to various normalization algorithms being part of Unicode. When talking about encoding languages one also runs into other translation and localization concepts like what thousands separator to use when displaying numbers and how to format dates. The [Unicode](https://www.unicode.org) standard covers all of this and more.

That said, the vast majority of times a programmer refers to Unicode, they mean its defined set of code points and sometimes the defined meaning of each character, as summarized in this file: <https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt>.

# Splitting bits

UTF-8 splits a code point into 1--4 bit groups depending on the number of bits needed to represent the code point as a binary integer.

| Bits needed | Groups used |
|-------------|-------------|
| 0--7        | 1           |
| 8--11       | 2           |
| 12--16      | 3           |
| 17--21      | 4           |

All but the highest-order group gets 6 bits; the highest group gets the rest.

Bit groups are arranged in big-endian order.

**Example:** U+1F41A uses 17 bits, so it needs 4 bit groups. We can find them by writing the code point in binary (1 1111 0100 0001 1010) and grouping 6 bits from the low-order bit (11111 010000 011010) then ordering high-to-low to get \[0, 0b11111, 0b010000, 0b011010]

# Padding bits

Each bit group is padded in its highest-order bits to make it a full byte.

Each group except the first uses the pad 0b10. The first uses a pad of 0b0 if it's the only group, or 0b1…10 with *n* 1 bits if there are *n* > 1 groups.

This means that every byte will have at least one 0 bit, and that the meaning of the byte can be found by splitting the byte into two parts: *n* 1s before the highest-order 0 and the binary number after the highest-order 0. If *n* is 0, this is the only byte of a 1-byte character. If *n* is 1, this is not the first byte of a character. If *n* is 2, 3, or 4 this is the first byte of a character with *n* bytes. If *n* is 5 or more, this is part of a valid UTF-8 encoding.^[It's also not part of a valid UTF-8 encoding if there are too many contiguous *n* = 1 bytes for the preceding *n* ≠ 1 byte or if the code point is larger than 0x10FFFF or is one of the few code points that Unicode has identified as never being used.]

| Byte | Meaning |
|-|-|
| 0xxxxxxx | only byte of character |
| 10xxxxxx | second, third, or fourth byte of a character |
| 110xxxxx | first byte of a two-byte character |
| 1110xxxx | first byte of a three-byte character |
| 11110xxx | first byte of a four-byte character |
| 11111xxx | invalid |

# Combined examples

**Example:** Encode U+0041 (capital A) in UTF-8

1. Write in binary and count the bits: 0b1000001, 7 bits
2. Look up the number of bytes needed: 1 byte for 0–7 bits
3. Split the bits: \[1000001]
4. Pad all but the first group with 10: nothing to do
5. Pad the first group based on the number of groups: \[**0**1000001]

**Example:** Encode U+06CD (Arabic yeh with tail, ۍ) in UTF-8

1. Write in binary and count the bits: 0b11011001101, 11 bits
2. Look up the number of bytes needed: 2 bytes for 8–11 bits
3. Split the bits: \[11011, 001101]
4. Pad all but the first group with 10: \[11011, **10**001101]
5. Pad the first group based on the number of groups: \[**110**11011, 10001101]

**Example:** Encode U+2331 (dimensional origin symbol, ⌱) in UTF-8

1. Write in binary and count the bits: 0b10001100110001, 14 bits
2. Look up the number of bytes needed: 3 bytes for 12–16 bits
3. Split the bits: \[10, 001100, 110001]
4. Pad all but the first group with 10: \[10, **10**001100, **10**110001]
5. Pad the first group based on the number of groups: \[**1110**0010, 10001100, 10110001]

**Example:** Encode U+12500 (cuniform sign LAK-608, 𒔀) in UTF-8

1. Write in binary and count the bits: 0b10010010100000000, 17 bits
2. Look up the number of bytes needed: 4 bytes for 17–21 bits
3. Split the bits: \[0, 10010, 010100, 000000]
4. Pad all but the first group with 10: \[0, **10**010010, **10**010100, **10**000000]
5. Pad the first group based on the number of groups: \[**11110**000, 10010010, 10010100, 10000000]

**Example:** Decode the first UTF-8 character in the byte sequence F8 93 EA 80 B2 5C 00

1. The first byte, F8, is 0b11111000 which has too many leading 1 bits to be any valid UTF-8 byte
2. The next byte, 93, is 0b10010011 which starts 10 and thus can't be the first byte of a character
3. The next byte, EA, is 0b11101010 which starts 1110 and thus the first byte of a 3-byte character; the data bits it provides are 1010
4. The next byte, 80, is 0b10000000 which starts 10 and thus a continuation byte of a multi-byte character; the data bits it provides are 000000
5. The next byte, B2, is 0b10110010 which starts 10 and thus a continuation byte of a multi-byte character; the data bits it provides are 110010
6. We now have all three bytes, for 0b1010000000110010 or 0xA032, meaning U+A032, the Yi symbol byt or ꀲ
