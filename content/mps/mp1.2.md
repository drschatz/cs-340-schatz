---
title: MP1.2
subtitle: Mystery C Code
author: Jule Schatz
---

This is not the full Machine Project (MP). It is part 2 of 3 that will count as MP1. 

MP1 - The goal of MP1 as a whole (parts 1, 2, and 3) is to give you indepth practice with C, VS Code, and problem solving. These are vital skills for the rest of the course (MPs, HWs, and Exams). Each part has a slightly different approach to give you a variety of practice. 

This MP part requires you to read, understand, debug, and verify C code. You will have the required knowledge to start this MP part after the second "C not C++" lecture.

In the modern world of programming, you will often have to read, verify, and fix code you are given, rather than write it from scratch. This MP part is designed to help you work on these skills. To get the most out of this MP part, I recommend not feeding any of the code to AI. Instead, I recommend the following approach:
1. Read through the code and comments carefully. Feel free to add more comments as you figure things out. Read the code multiple times.

2. Run the code with the debugger and step through each part slowly. Think critically what you expect the code to do and then see if that is what is actually happening based on the debugger output. Feel free to add code and play around.

3. If you get stuck (30+ minutes of no progress), post on campuswire or come to office hours. This will take longer than getting the answer from AI but it has two benefits. 

    a. You will get a hint to get unstuck instead of just the answer. This will help you actually learn the skills you need.

    b. You will network with the professor, course staff, and other students. These connections will be vital in your schooling and career. It's also nice to connect with other humans! 

# Learning Goals
1. Be able to read, understand, and fix code.
2. Be able to work with dynamic memory, arrays, and c-strings in C. 
3. Be able to verify a program works as expected.
4. Be able to figure out how to work with VS Code (prompting AI is allowed for this part)
5. Be able to answer the 2 questions on lines 23 and 102. 

# Task 1 - Fix the code
Imagine you received the file `mystery.c` code from an AI or colleague. You need to send a working version to your boss within a week. You can assume all the comments are accurate but that some of the code does not fully implement what the comments claim. Feel free to rework the code however you wish but each issue can be fixed with only changing a few lines.

** Unlike MP1.1, you DO have to understand the C code to debug this program. **

# Task 2 - Verify the code
This specific MP part does not have public tests. Instead, you will submit your code on Prairie Learn blind. You will receive a grade within a week AFTER the deadline. This is to give you experience with a realistic workflow. Imagine you are sending this file to your boss. It wouldn't be great if you kept sending her different versions until she says it works. Instead, you have to verify the code yourself before submitting. Note that not every MP will require you to verify your own code but the exams most likely will. 

Here are some ideas to help you get started:
1. Make a small version of `words_alpha.txt` to run with the program. Figure out, by hand, what the output should be and verify that is indeed what the program produces. 

2. Find a friend in the class (office hours are great for finding people), and make examples together to try. Then make sure your code does the same thing as your friend's code. 

3. Run your code with valgrind to make sure there are no memory errors. 
```sh
valgrind --leak-check=full --show-leak-kinds=all ./a.out
```

# Logistics

## Starter code
Download the buggy code from [`mp1.2.zip`](../mp1.2.zip) and unzip it on your computer into the `cs340` directory you created during the environment setup.

## Running the code 
Part of the MP is figuring out how to compile and run this MP. You may use AI/Search Engines for help in how to compile, run, and start the debugger in VS Code. Feel free to look at other released MPs, to make your own Makefile, etc...

## Submitting and Grading
You can submit `mystery.c` as many times as you would like on Prairie Learn up to the deadline. I will grade the most recent submission. 

If you submit within 24 hours after the deadline you will recieve only up to 90% credit for the MP.

## AI Policy
To get the most out of this MP and to avoid an academic integrity violation follow these rules for this MP. 

1. Do not feed AI/Search Engines any of the code in `mystery.c`. For example, do not look up: "What does this line do FILE* fl = fopen("words_alpha.txt", "r");"

2. You may use AI/Search Engines to look up syntax. For example, you can look up: "How does the fopen function work in C? Can you show me an example?" 

3. You may use AI/Search Engines to figure out how to compile, run, or run the debugger for `mystery.c`. For example, you can look up: "I'm using VS Code to run a C program. How do I set up the debugger so I can step through the code?" 

4. Office hours are always open to any questions!

** If you aren't sure what is allowed, feel free to ask on campus wire or office hours. **