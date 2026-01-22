---
title: Terminal / Shell Basics
description: An introduction to using the terminal and shell
---

## Definitions

**Terminal** - A text-based interface where you can type commands.

**Shell** - A program that interprets and runs text commands. These commands are typically entered through a terminal.

*Note: The terms *terminal*, *shell*, and *command line* are often used interchangeably.*

**Directory** - Another name for a folder.

---

# Basic Commands 
- `ls` — Lists the contents of the current directory.
- `pwd` — Prints the full path of the current directory.
- `cd` — Changes the current directory.

---

## `ls` in Detail

The `ls` command is used to see the files and directories that are in your current directory. To use it, type the following and hit enter:

```bash
some-header% ls
```

*Note: `some-header%` represents your shell prompt. You only type the command after it (in this case, `ls`).*

Many shell commands accept flags that modify their behavior. For example, `ls` supports the `-l` flag, which displays a detailed (long-format) listing. You would run `ls` with the `-l` flag like so:

```bash
some-header% ls -l
```

To learn about a command and its possible flags, open up the relevant manual pages like so:

```bash
some-header% man ls
```

Press `q` to exit the manual page.

---

## `pwd` in Detail

Every shell session has a **current directory**. Commands such as `ls` operate relative to this directory. The `pwd` command prints the full path to your current directory. This path shows all parent directories, separated by `/`. To run the `pwd` command you would just type it in like this and hit enter:

```bash
some-header% pwd
```

---

## `cd` in Detail

To change your current directory, use the `cd` command. For example, to move into a subdirectory named `sub-dir` you would type the following and hit enter:

```bash
some-header% cd sub-dir
```

To move back to the parent directory you would do:

```bash
some-header% cd ../
```

You can also chain directory changes together. For example, to move up two directories and then into a directory named `Documents` you would do:

```bash
some-header% cd ../../Documents
```

This command first moves up two levels, then moves into the `Documents` directory.

---

## More Commands

There are many more shell commands available beyond these basics. These examples are meant to get you started. The best way to learn is to look things up and experiment using them.

---

# Running a Program with the Shell

## C Programs

To run a C program, you must first compile it. This process is typically done from the terminal.

To compile a C program, you specify:
1. The compiler you want to use (for example, `gcc`)
2. All `.c` files that contain your program’s code (source files)
3. Optionally a `-o` flag and the name you want the executable to have

Across all source files:
- Each function must be **defined exactly once**
- One file must contain a `main()` function
- Each file must have access to the declarations of any functions it calls. This is typically done by including a `.h` (header) file at the top of each `.c` file. During compilation, the contents of the header file are copied into each source file that includes it.

**Function Definition** - Includes both the function header and its body.

**Function Declaration** - Includes only the function header.

To compile two .c files into an executable called `exec` you could do a command like this:

```bash
some-header% gcc test.c func.c -o exec
```

Then, if your sucessful, you can run it like this:

```bash
some-header% ./exec
```

You can always use a directory path to indicate where a file is relative to your current directory. For example, if your exec file lived in a sub directory called bin, you would run:

```bash
some-header% ./bin/exec
```

---

## Makefiles

All MPs in this class include a Makefile. A Makefile automates the compilation and testing process.

The available commands will be described in each MP’s specification, but commonly include:

```bash
some-header% make test
```
or
```bash
some-header% make
```

To remove any executable files the make command created, you can always run the following:

```bash
some-header% make clean
```

---

## Python Programs

You can also run Python programs directly from the terminal. If your program is named `test.py`, run it using:

```bash
some-header% python3 test.py
```

Python programs are interpreted, not compiled, so there is no separate compilation step as there is with C. More on this later!
