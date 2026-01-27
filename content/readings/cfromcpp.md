---
title: C without the ++
author: Luther Tychonievich
---

This page is intended to be a quick reference to C assuming you are already familiar with C++.

# Summary of differences from C++

1. **C is (mostly) a subset of C++.** There's (almost) no new language to learn, but there are some things to unlearn and some simpler replacements for C++'s more complicated components.

2. **No templates or namespaces.** If the C++ includes a template (e.g. `x<y>`), it's not permitted in C. If it contains a namespace (e.g. `std::y` or `using std`) it's also not permitted in C.

3. **No classes.** The `class` and `this` keywords (and other class-specific keywords like `friend`, `public`, `virtual`, etc.) are C++ additions not present in C. A `struct` can store data like a class, but can't have member methods. Object orientation can still be implemented using pointers to structs and member function pointers, but this is rarely done in practice.

4. **No function overloading.** Each function name can have one and only one definition and signature. If you have a `foo(int)` you can't also have a `foo(double)` or `foo(int, int)`. To help with this, C functions often have suffixes on their names that indicate their argument types, like `strtol` and `strtoll` which differ in having an argument of type `long` or `long long`.
    
    As a seeming exception to this rule, C makes more use of variadic functions than C++. These have some number of fixed arguments followed by any number of additional arguments of any type. The fixed argument values are used to dynamically determine the number and type of the remaining arguments. `printf` is by far the best-known example of this type of function.

5. **No `new` or `delete` operators.** Instead, memory is allocated with the `malloc`, `calloc`, and `realloc` functions and deallocated with the `free` and `realloc` functions. These all handle untyped memory as `void *`s and need to be told the size of the data in bytes, meaning C code typically has many more `sizeof(type)` operators than would the corresponding C++ code.

6. **No pass-by-reference.** Equivalent semantics can be created by passing pointers and dereferencing them during use at the cost of slightly more verbose code.

7. **No operator overloading.** `<<` only means left-shift, never output. `+` only means addition, never string concatenation. And so on.

8. **Different common library code.** Common C++ library functions and types like `string`, `cout`, `cin`, `vector`, and `map` do not exist in C. Strings are stored as `char *`s; I/O is handled with `FILE *` and functions like `fopen`, `printf`, and `fread`; and if you want a data structure you'll generally have to program it yourself.

# Code snippets

The following code snippets are intended to demonstrate some patterns common to C coding.

## Print integers between two endpoints

```c
#include <stdio.h> // has printf, fprintf, stderr
#include <stdlib.h> // has strtol

int main(int argc, char *argv[]) {
    if (argc != 2) { // want 1 and only 1 argument
        
        // fprintf = formatted print to FILE*
        // FILE *stderr is defined in stdio.h
        // %s means "replace with a string argument after this"
        fprintf(stderr, "USAGE: %s num\n", argv[0]);
        
        return 1; // != 0 means failure to operate
    }
    
    // strtol = string to long
    // NULL means ignore what comes after the integer, if anything
    // 10 means base-10 (decimal) parsing
    long end = strtol(argv[1], NULL, 10);
    
    if (end < 1) {
        fprintf(stderr, "USAGE: %s num\n", argv[0]);
        fprintf(stderr, "  num must be a positive integer, not \"%s\"\n", argv[1]);
        return 1;
    }
    
    for (long i=1; i<=end; i+=1) {
        // printf = formatted print to stdout
        // %ld = replace with a long argument formatted as a base-10 (decimal) integer
        printf("%ld\n", i);
    }
    return 0; // == 0 means success
}
```

## Singly-linked list of `int`s

Several peculiarities with `struct` definitions like this deserve additional note:

- `struct { ... }` is the name of a type, just like `int` or `double` are. But we rarely use this form.
- `struct name { ... }` names the type "`struct name`" (not just "`name`") and is the only way to have a type that contains a pointer to another instance of the same type of struct. It is common to add a `_t` or `_s` after such a name to make it stand out more.
- `typedef type name;` names the type "`name`".
- `typedef struct name1 { ... } name2;` makes two names for the same type: `struct name1` and `name2`. `name2` is more convenient, but doesn't exist until after the `;` so inside the structure definition we use `struct name1` instead.

The list is comprised of several nodes, each pointing to the next. We reference the list using a pointer to the first node in the list. Because the functions can modify the list, we pass in a pointer to that pointer; that way the functions can modify `*list` to change the pointer, and thus which node is first in the list.

```c
#include <stdio.h> // for printf
#include <stdlib.h> // for strtol, malloc, free
#include <string.h> // for strlen

typedef struct list_node_t {
    int val;
    struct list_node_t *next;
} list_node;

/**
 * Given a list and a number, pushes the number onto the head of the list.
 *
 * @param  list  A pointer to the list; the list is a pointer to a node.
 *               Will be modified to point to the new head of the list.
 * @param  n     A number to push onto the list.
 */
void list_push(list_node **list, int n) {
    // allocate memory for a new node
    list_node *node = malloc(sizeof(list_node));
    // initialize its contents
    node->val = n;
    node->next = *list;
    // and make it the new head of the list
    *list = node;
}

/**
 * Given a list, pops off the head of the list.
 *
 * @param  list  A pointer to the list; the list is a pointer to a node.
 *               Will be modified to point to the new head of the list.
 * @return       The value previously in the head of the list -- i.e. 
 *               what (*list)->val was before this function was called.
 */
int list_pop(list_node **list) {
    // copy the head of the list into a variable
    list_node *head = *list;
    // change the list to start after the head
    *list = (*list)->next;
    // copy the value
    int result = head->val;
    // and deallocate the detached head node's memory
    free(head);
    // then return the value
    return result;
}

// Demo: print the length of each command-line argument in reverse order
int main(int argc, char *argv[]) {
    list_node *list = NULL; // make an empty list
    for (int i=0; i<argc; i+=1) {
        // push the length of each argument
        list_push(&list, strlen(argv[i]));
    }
    while (list) { // repeat while list != NULL
        // pop a value and print it
        // list_pop also updates what `list` points to
        printf("arg length: %d\n", list_pop(&list));
    }
    return 0;
}
```

# Control constructs

C has the following control constructs:

- `goto` and labels
- Branches:
    - `if`/`else`
    - `switch`/`case`/`default`/`break`
- Loops:
    - `do`/`while`
    - `while`
    - Three-expression `for` -- `for(initializer; condition; update)`
    - All allow `break` and `continue`
- Function definitions and invocations

# Data types

C has the following datatypes:

- **Signed integers:** `char` (8 bits), `short` (16 bits), `int` (32 bits), `long` (usually 64 bits), `long long` (64 bits).
    - Any may be preceded with `unsigned` to have an unsigned integer type.
    - In `#include <stdint.h>` there are more reasonable names: `intN_t` for signed integers with N bits and `uintN_t` for unsigned integers with N bits.
    - In `#include <stddef.h>` (and many other headers too) there are two "size-of-a-pointer" integer types, `size_t` (unsigned) and `ptrdiff_t` (signed). On most 2020s-era computers these are 64 bits, but on older or embedded systems they may be 32 bits instead.

- **Floating-point numbers:** `float` (32 bits), `double` (64 bits), and `long double` (64 or more bits).

- **Pointers:** Usually with the type pointed to indicated (e.g. `int *`, `double *`, etc) but the special pointer type `void *` does not indicate what type it is pointing to and cannot be dereferenced without first converting it to a different type.

- **Function pointers:** Technically a type of pointer but have a very different syntax: `returntype (*variablename)(arg1type, arg2type)`.

    <details class="example">
    <summary>The following code uses function pointers to apply several operations to a list.</summary>

    ```c
    int add(int a, int b) { return a+b; }
    int sub(int a, int b) { return a-b; }
    int mul(int a, int b) { return a*b; }
    int (*ops[])(int,int) = {add, sub, mul};
    int nums[4] = {124, 128, 225, 340};

    int main(int argc, char *argv[]) {
        for(int i=1; i<4; i+=1) {
            nums[i] = ops[i-1](nums[i-1], nums[i]);
        }
        // nums is {124, 124+128, (124+128)-225, ((124+128)-225)*340}
        printf("%d %d %d %d\n", nums[0], nums[1], nums[2], nums[3]);
    }
    ```
    
    </details>

- **Arrays:** Several values of the same type are contiguous in memory.

- **Structs:** Several values of various types are contiguous in memory.

- **Unions:** Several values of various types all overlap in the same memory.

The `typedef` keyword gives a new name to an existing data type and is used extensively in C code to create everything from renamed integer types like `size_t` and `uint8_t` to renamed structs with other renamed components inside.

**Notably absent in the above list:**

- Boolean values can be any type; all-zero-bits means false, anything else means true. Boolean operators like `!` create `int` results with 0 for false and 1 for true.

- Classes, namespaces, iterator loops, and template types do not exist in C.

- Reference types (which C++ allows for function parameters only) do not exist in C.

# Literals

- **Integers** can be expressed in decimal, `340`; hexadecimal, `0x145`; octal, `0524`; or binary, `0b101010100`.

- **Integers** can also be expressed in UTF-8; for example ☺ is U+263A and is encoded in UTF-8 as E2 98 BA so `'☺'` means the same thing as `0xE298BA`.

- **Floats** can be expressed in decimal, `340.0`; exponential form with a base-10 exponent, `3.4e2`; or hexadecimal exponential form with a base-2 exponent, `0x1.45p+8`.

- **Arrays** can be expressed by placing values inside braces, `int x[4] = {124, 128, 225, 340}`. This notation does not supply enough information to unambiguously identify the data type, so it is only permitted as part of assignment to an appropriately-typed variable.

- **Structures** can be expressed by placing values inside braces, `struct {int first,next,then,now;} x = {124, 128, 225, 340}`. This notation does not supply enough information to unambiguously identify the data type, so it is only permitted as part of assignment to an appropriately-typed variable. They can also have field names and be placed in any order, `struct {int first,next,then,now;} x = {.now=340, .first=124}`

- **Double-quoted string literals** are pointers to arrays stored in read-only global memory (i.e. memory the operating system will not let us modify once the program begins), where the contents of those arrays are the UTF-8 encoding of the string contents (after resolving any \\-escapes like \\n or \\u0145), with one extra byte set to 0 at the end of the array.

**Example:**

In the following code, each `x`, `y`, and `z` are pointers to arrays containing the same byte sequence, but `x` and `y` point to arrays in modifiable global memory while `z` points to an array in read-only global memory.

```c
char x_data[8] = {'S', 'y', 's', 't', 'e', 'm', 's', 0};
char y_data[8] = {83, 121, 115, 101, 109, 115, 0};
char *x = &x_data;
char *y = &y_data;
char *z = "Systems";
```

# Operators

- **Arithmetic:** `+`, `-`, `*`, `/`, `%`
- **Bitwise:** `>>`, `<<`, `|`, `&`, `^`, `~`
- **Logical:** `&&`, `||`, `!`
- **Comparison:** `<`, `<=`, `==`, `!=`, `>=`, `>`
- **Address-of:** `&`
    
    If you use an array where a pointer is expected, a `&` is inserted automatically by the compiler.

- **Dereference:** `*`, `[]`, `->`
    
    `a[i]` and `*(a+i)` are synonyms, as are `(*a).` and `a->`

- **Member of:** `.`, `->`
    
    `(*a).` and `a->` are synonyms.

- **Assignment:** `=`

- **Update:** `++`, `--`, and *op*`=` for all arithmetic and bitwise operators *op*
    
    Prefix `++x` can be marginally faster than postfix `x++` in some situations; likewise for `--x` and `x--`.
    
    `x+=1` and `++x` are synonyms, as are `x-=1` and `--x`.

- **Cast:** `(`type`)`
    
    C inserts implicit casts in many places.

- **Selection:** `?:`
    
    `a?x:y` evaluates to `x` if `a` is true, otherwise it evaluates to `y`.

- **Function call:** `()`

- **Type inspection:** `sizeof`, `alignof`

- **Sequence:** `,`
    
    `x,y` has the side effects of `x` (if any), then evaluates to `y`.


# Always pass-by-value

C only has one way of assigning variables or passing values into functions: by value. That means *copying the bytes* that make up the value; what some other languages call a "shallow copy."

**Example:**

```c
void foo(int a[3]) { // a gets a copy of the bytes stored in the array
    a[2] = 1; // this changes only the local copy
}

int main(int argc, char *argv[]) {
    int x[3] = {3,4,0};
    foo(x);
    printf("%d%d%d\n", x[0], x[1], x[2]); // prints 340 not 341
}
```

This also applies to pointers. A pointer is a value, represented by bytes. Those bytes happen to be the address of a different value, but for the purposes of assignment and function invocation they are treated like any other bytes. However, C will automatically convert any array into a pointer to its first element if the variable or argument has that type.

**Example:**

```c
void foo(int *a) { // a gets a copy of a pointer, not of the pointed-to memory
    a += 1; // this updates the local pointer to point 1 int later in memory
    *a = 1; // this updates the int in memory pointed to by the local pointer
}

int main(int argc, char *argv[]) {
    int x[3] = {3,4,0};
    foo(x);
    printf("%d%d%d\n", x[0], x[1], x[2]); // prints 310 not 340
}
```

# File I/O

C comes with a large library of input/output functions that interact with a `FILE *` argument, defined in `stdio.h`.

A `FILE *` is what is known as an **opaque pointer**: the compiler is not given any information about the data being pointed to besides its type name, preventing you from writing code that interacts with the contents of that structure. Each implementation of the standard library may have its own way of storing a `FILE` structure, but the usual idea is to store both a file descriptor and an array called a buffer. Most operations you do will interact with the buffer, which will only be synced to disk via the file descriptor when the buffer is full (if writing) or empty (if reading). This means that closing a `FILE *` is an important step in ensuring that what you did to it actually reaches the disk.

Each program initially has three open `FILE *`s in the global scope: `stdout` and `stderr` are opened in write-only mode and `stdin` is opened in read-only mode.

## File modes and positions

A file may be opened in several different modes. The most common modes (with their `fopen` `mode` argument values) are:

- `r` -- read only. The file position starts at the beginning of the file, and you can't write to it, only read.
- `w` -- write only. The file is erased when it is opened and you can't read from it, only write.
- `a` -- append only. This is like `w`, except the file is not erased and every write gets put at the end of the file.
- `r+` -- reading and writing. The file position starts at the beginning of the file, and you can both read and write data.

Each file has a notion of a "file position". Early files worked on magnetic tape held between two reels, with just one spot on the tape underneath the magnetic head that could read and write the contents of the tape. To read 20 bytes (bytes are a unit of digital information; we will dive more into this topic later in the course) of data, you also had to advance the tape by 20 bytes, meaning the next read would start after the first. This concept remains the dominant model for files today: they may be just large arrays of bytes under the hood, but the operating system APIs that let you access them have a notion of a position that is advanced every time you read or write. If you want to change that position in any other way, you have to explicitly "seek" a new position.

For `FILE *`s, `fseek` and `ftell` will let you manually manipulate the file position.

## Byte-oriented I/O

Files store bytes. `fread` lets you read an array of bytes from a file, and `fwrite` lets you write an array of bytes to a file. You can also work one byte at a time using `fgetc` and `fputc`, though those are less efficient.

`fread` and `fwrite` use the `void *` type for the array they read to or write from. `void *` means "a pointer to something, but the compiler can't tell what." To help the functions know how to write those values, we have to tell it two more pieces of information: first, the size (in bytes) of a single element in the array pointed to by the `void *`; and second, the number of elements in that array.

**Example:** To write the bytes of an array of `long`s to a file, we might do the following:

```c
long x[4] = {124, 128, 225, 340};
FILE *myfile = fopen("demo.dat", "w");
fwrite(x, sizeof(long), 4, myfile);
fclose(myfile);
```

To read it back again we'd do:

```c
long y[4];
FILE *myfile = fopen("demo.dat", "r");
fread(y, sizeof(long), 4, myfile);
fclose(myfile);
```

Note that writing values in this way generally results in non-cross-platform files because the exact bytes used to store a value is implementation defined.

## String-oriented I/O

The C standard library has various string-oriented reading and writing functions. The most versatile are `fprintf` and `fscanf`, but there are others like `fgets`, `getline`, and `perror`.

The only one of these functions that we'll use in CS 340 is `printf`, which wraps `fprintf` to always use `stdout` as its `FILE *`.

`printf` is a **variadic function**, meaning it can be called with a variable number of arguments. Its first argument is always a string, with the string being parsed to figure out how many other arguments there will be and their types. Arguments are noted in the string using "conversion specifiers", which are a `%`, optionally some formatting information, and a letter. There are many conversion specifiers, but the following are particularly common:

- `%s` -- A string (i.e. a `char *`)
- `%d`, `%u`, `%x` -- An integer, to be displayed in base-10 signed (`%d`), base-10 unsigned (`%u`), or base-16 unsigned (`%x`)
- `%p` -- A pointer, displayed in hexadecimal
- `%f`, `%e`, `%g` -- A floating-point number, displayed in fixed point (`%f`), exponential notation (`%e`), or whichever is smaller (`%g`)

These often have additional information between the `%` and the letter. For example:

- `%zd`, where the `z` means "treat the integer as a `size_t`"
- `%llx`, where the `ll` means "treat the integer as a `long long`"
- `%.4g`, where the `.4` means "show four digits of precision"

Mastering all `printf` conversion specifiers is unlikely to be worth your while, but learning enough to display basic information is.

**Example:** The following shows how to display the value of three variables using `printf`:

```c
void f(int x, const char *s, double y) {
    // ...
    printf("%s (%d): x=%d, s=\"%s\", y=%g\n", x, s, y);
    // ...
}
```

# Heap memory

C does not have a `new` or `delete` operator. It also never implicitly creates or expands memory. If you want to allocate, adjust, or deallocate memory, you have to use a function to do so.

There are several operating-system-level memory allocation functions, such as `brk`, `sbrk`, and `mmap`, but they are challenging to use well and should generally be avoided. Instead, almost all C code uses four functions found in `stdlib.h`: `malloc`, `free`, `realloc`, and `calloc`.

`malloc` allocates a contiguous range of bytes and returns a pointer to the first byte. It leaves *undefined* what the values of those bytes are.

`calloc` is much like `malloc`, except it sets all the bytes to 0 before returning the pointer. It also has two size arguments to make it less likely that programmers will make certain mistakes when allocating arrays.

`free` accepts a pointer returned by `malloc` (or `calloc` or `realloc`) and deallocates the memory it points to.

`realloc` "resizes" a region of memory. Roughly that means that it (a) `malloc`s a new region of memory; (b) `memcpy`s byte values from the old to the new; (c) `free`s the old; and (d) returns a pointer to the new. In practice, it is often much more efficient than that set of steps, in some cases requiring almost no time at all.

When working with these functions, it is important to obey the following rules:

- **Once a piece of memory is `free`d, do not refer to that memory in any way again.**
    
    Failure to follow this rule is called the "use after free" error (or the "double free" if the second reference is using the pointer as an argument to `free`) and is a major security vulnerability that can result in attackers compromising your system.

- **Never attempt to access anything outside the bounds of an allocated block of memory.**
    
    Failure to follow this rule can have a variety of unexpected results; it might crash the program, or change how it operates in all cases, or change how it operates in just a few special cases, or introduce a security vulnerability.

- **Never lose track of a `malloc`ed pointer without first `free`ing it.**
    
    Failure to follow this rule is called a "memory leak" and can significantly harm the performance of your program, and in some cases all other programs running on your computer.

- **Never `free` anything that wasn't returned by `malloc`, `calloc`, or `realloc`.**
    
    Failure to follow this rule usually causes a program to crash, though sometimes it doesn't seem to do anything. If it is paired with another error like use after free, it can exacerbate the other error's results.
    
    This rule means the *exact* pointer. `free(malloc(100)+50)` is an error; the pointer being freed does point to memory inside a `malloc`ed block of memory, but is not the exact pointer that was returned by `malloc`.

Some other standard library functions explicitly mention `malloc` and/or `free` in their documentation; for example, `strdup` says in part "Memory for the new string is obtained with **malloc**(3), and can be freed with **free**(3)." This is documented so that you know how the above rules apply to those functions too.
