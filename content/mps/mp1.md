---
title: MP1
subtitle: Debugging
author: Wade Fagen-Ulmschneider
---

This is not a full MP.
It is **dramatically easier** than other MPs.
Don't plan your time on other MPs based on this one.

The purposes of this MP is to have you see some of the functionality the VS Code debugger can do.

Is it possible to create the required `gif.c` without doing these two things?
Yes.
Should you do that?
No.

# Fetch starter code

We have some initial code for your `mp1` for you to get started.
Download it from [`mp1.zip`](mp1.zip) and unzip it on your computer into the `cs340` directory you created during the environment setup.

# Use Visual Studio Code

Visual Studio Code (more often called VS Code) is an Integrated Development Environment (IDE) with many features shared with other IDEs.
Learning to use it well will help you feel comfortable in other IDEs you may use in the future.

## Projects

IDEs have the notion of projects, which contain a set of files related to a single task or program.
Typically, these reside in a folder and all of its subfolders.
In this class, each MP will be its own project, meaning you need to open VS Code in `mp1` or `mp2` or the like, not in some parent folder that contains them all.

A folder that is set up to be a VS Code project will have inside of it a folder named `.vscode`.
In many systems files and folders with names that start with a `.` are hidden from view.

To open the `mp1` folder in VS Code, do one of the following:

- From a terminal, `cd` into the `mp1` folder and run `code .`
- Inside of VS Code, use File → Open Folder to open a new folder.

## Integrated Terminal

IDEs give access to the terminal, but often add configuration so that it's got everything needed to build the project ready to use.
To open VS Code's integrated terminal, use the keyboard shortcut Ctrl+~.

Using the integrated terminal, let's verify you are all set up for running C programs by doing the following:

- On your terminal, run `make` to compile the provided code.
- If you receive any errors, read the error messages. They will often be helpful to describe what's going wrong. If you're stuck here, reach out to get help!

## Visual Debugger

IDEs provide a user interface over the normal debugger tools for your language.
In VS Code, the debugger tool to use and how to attach it to the visual debugger is defined in `.vscode/launch.json`.
Designing these configuration files is not a goal of this course, so we provide them for each MP.

Our `launch.json` files for `C` programs use `Makefile`s, one of the oldest and best-established command-line build management tools.
You can compile your code from the command line by typing `make` and run any tests we provided by typing `make test`.
The `launch.json` will do these two commands but attach a debugger to the running code, and may also have other commands for handling specific cases in some MPs.

You can run VS Code's debugger in two ways:

- On the left side of Visual Studio Code, find the "Run and Debug" Interface
- Once on the "Run and Debug" interface, find the green "Debug" arrow to start your program with a visual debugger

Depending on the project, it may ask you to pick a launch configuration to run and may ask for per-run configuration.

For MP1, start by accepting the defaults when you run the debugger.
After a moment the debugger will pause execution because of a segmentation fault.

# Debug the Code

To help you learn how to use the debugger, we provide a version of `gif.c` that has multiple bugs inserted.
Each bug is designed to help you see the value of a different aspect of the debugger.

Each bug can be fixed by deleting a single line of code in `gif.c`. That's obviously not true of most real bugs: they tend to span many lines and even many files. Our goal in this MP is not to show you what real bugs look like, it's to show you what the debugger can do.

## Segmentation fault

A segmentation fault occurs when code tries to dereference a pointer to memory that is not in use.
Memory references occur with the `*address`, `address->`, and `address[offset]` operators.
Debuggers are very good at locating segmentation faults, but the bug that caused the fault is often in an earlier line that computed the address (or failed to do so).

MP1 has several segmentation faults.

## Call Stack Inspection

When the debugger pauses, either on an error or because you added a breakpoint, the "Run and Debug" window shows a wealth of useful debugging information.

One panel is labeled "Call Stack". It will list the function calls that were called leading to where your program is currently paused. You can **click on them** to jump to their location in code.

In a call stack, the top is the most recent function called. The call stack is very useful for finding **infinite recursion** if you see the same function name again and again and again. You will want to reference the call stack for several bugs in `mp1`.

## Pause-and-step

If there's an infinite loop, the program will appear to make no progress.
In that case, you can pause the debugger and step through the code to see what is happening.

Pressing the left-most "Pause" button will pause the execution of the program and provide you information about the current point of execution. When the program is paused:

- You can **hover over variables** to see the values their hold
- You can **view the call stack** and other debugging information
- You can **use the control window** to step through your code line-by-line

## Breakpoints

When a program is doing the wrong thing, the most common approach to debug is to set a breakpoint.
This means picking a line of code and telling the debugger to pause when it reaches that line (before it runs it).

To set a breakpoint, **click on the space immediately to the left of the line number**. A bright red dot will appear to indicate that an active breakpoint is set.

In the example above, execution will pause after running Line 834 but before running Line 835. Since it's paused, you can inspect all of the variables at the exact moment before running Line 835. If you resume the program and the breakpoint is encountered again, it will pause again.

If you've done print-based debugging before, that's a sloppy way of trying to approximate a breakpoint + hovering over variables without using a debugger.

## Watches and Beyond

Sometimes a variable changes many times, with the information you need to debug it appearing and then disappearing later.
There are multiple debugging tools for these situations, which can get quite involved.

In MP1 we have one bug that could benefit from these tools, though it could also be debugged with a breakpoint and stepping if you are patient.
After you've fixed all the obvious bugs the code will run but it won't do very much.

There's still another bug: logic error in the resulting behavior, one of the hardest kinds of bugs to find because nothing crashes. To help you find it, **there's a secret message** explaining how to fix it inside the global `message` variable, but that message is only there part-way through a run of the program. Find the message and make the final fix to complete the MP.

# Submission and Grading

Only edit `gif.c`, none of the other files we provide.
`gif.c` is the only file you can upload so if you change anything else your code won't work the same for you as it does for us.

When you think you are done, `make test` will run all our tests and report what grade we think you've earned.

Once you've passed all the tests, submit your code on the upload site.

The final line of output from `make test` will be `SCORE: 0 / 1` or `SCORE: 1 / 1`:
this tells you how much credit you'll get if you submit this code.

You may submit as often as you like, including replacing old submissions.
This is true of all MPs.
Only your last submission (prior to the end of the late submission window) will be included in your grade.
