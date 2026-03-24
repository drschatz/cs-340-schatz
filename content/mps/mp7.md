---
author: Jule Schatz
subtitle: Scheduler Testing
title: MP7
---
In this Miso Potato (MP), you will be given multiple versions of a scheduler. It is your job to verify which versions work and which have bugs. 

### Learning Goals
LG - Being able to comprehend and verify complex specifications through testing.

LG - Practice basic python programming. 

LG - Develop a deeper intuition of scheduling jobs on a computer system. 

# Initial Files

### Code
[`mp7.zip`](../mp7.zip) - Contains the necessary code files for completing the MP.

This includes 6 versions of a scheduler (a-f). You do not need to read or look at these files. Everything you need to complete the MP will be in the specifications. Your task is to write python tests in `tests.py` to verify and check the behavior for each of the scheduler implementations. You will only turn in `tests.py`.  

To compile all schedulers for testing run, `make` from the terminal. This will compile each of the schedulers using the ISA that works on your specific computer. These executables are all you need from the scheduler code.

# Your Task
Note that while staff are happy to help they will expect you to have followed these steps. For example, if you missing a bug the staff will ask to see your worksheet, not your tests.py. 

1. Read through the [`Scheduler Specification`](../mp7/scheduler_spec.pdf).
    - This describes the expected behavior from a scheduler.
    - You will come back to this document often. This is just your first read through.
2. Read through the [`Testing Guide`](../mp7/testing_guide.pdf).
    - This explains how you will write tests and what resources you have access to when using the test harness. 
3. Open and make a copy of the [`Worksheet`](https://docs.google.com/document/d/1rmUiLuMFQQHgMEvTQwxIfAX8CoND-xfH_9XE1RfgNQ8/edit?usp=sharing).
    - This worksheet specifies which sections of the scheduler specifcations you need to verify: The results file, scheduling behavior, and timing. 
    - For each section, first make a list of expected behaviors. The results file section has already been filled out for you. Reference the `Scheduler Specification` as much as you need.
    - Then, for each section, come up with a scenario that would check or expose the expected behavior. An example has been provided. Reference the `Testing Guide` as much as you need.
4. Write the scenarios into python tests in `tests.py`. Reference the [`Python Text`]() as much as you need.
5. Run your tests against the given schedulers

```bash
make
python3 tests.py --all
```

Your code is correct when scheduler_a is the only scheduler that comes back as working correctly.

6. Submit tests.py to the autograder. 