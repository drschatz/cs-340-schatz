---
author: Jule Schatz
subtitle: Scheduler Tests
title: MP7
---
In this Miso Potato (MP), you will write tests to verify the behavior of a scheduler. 

### Learning Goals
LG - Being able to comprehend and verify complex specifications through testing.

LG - Practice basic python programming. 

LG - Develop a deeper intuition of scheduling jobs on a computer system. 

# Initial Files

### Code
[`mp7.zip`](../mp7.zip) - Contains the necessary code files for completing the MP.

This includes a working solution of a scheduler (scheduler_correct.c). You do not need to read or look at this file. Everything you need to complete the MP will be in the specifications. Your task is to write python tests in `tests.py` to verify and check the behavior for scheduler implementations. You will only turn in `tests.py`.  

To compile the solution scheduler for testing run, `make` from the terminal. This will compile the scheduler using the ISA that works on your specific computer. This executable is all you need from the scheduler code.

# Your Task
Note that while staff are happy to help they will expect you to have followed these steps. For example, if you missing a bug the staff will ask to see your worksheet, not your tests.py. 

1. Read through the [`Scheduler Specification`](../mp7_files/scheduler_spec.pdf).
    - This describes the expected behavior from a scheduler.
    - You will come back to this document often. This is just your first read through.
2. Read through the [`Testing Guide`](../mp7_files/testing_guide.pdf).
    - This explains how you will write tests and what resources you have access to when using the test harness. 
3. Open and make a copy of the [`Worksheet`](https://docs.google.com/document/d/1rmUiLuMFQQHgMEvTQwxIfAX8CoND-xfH_9XE1RfgNQ8/edit?usp=sharing).
    - This worksheet leads you through making tests for an implementation of a scheduler based on the `Scheduler Specification`
    - First make a list of expected behaviors. We have provided the expected behaviors for the `Results File` as an example.
    - Then, for each row, come up with a scenario that would check or expose the expected behavior. An example has been provided in the `Scheduler Specification` section.
    - Reference the `Testing Guide` and `Scheduler Specification` as much as you need.
4. Write the scenarios into python tests in `tests.py`. Reference the [`Python Text`](../python-cheat.pdf) as much as you need.
5. Run your tests locally

```bash
make
python3 tests.py ./scheduler_correct
```

Locally, all your tests should pass.

6. Submit tests.py to the autograder to see if you can catch the bugs in the buggy versions of the scheduler. 