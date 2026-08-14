---
title: MP3.2
subtitle: Word, Set, Go! 
author: Jule Legende
---

This is not the full Mighty Problem (MP). It is part 2 of 2 that will count as MP 3. 

MP 3 - The goal of MP 3 as a whole (parts 1 and 2) is to give you practice and intuition around manipulating data on a bit level. Each part uses a different example.

For this part of MP 3 you will be speeding up your code from MP 1.2 using bit sets! Running MP 1.2 on my computer takes around 6 seconds to complete. The part that takes so long to run is the three nested loops towards the bottom which tries to find three 5-letter words with no overlapping letters. The big O of this part of the code is O(n^3) where n is the size of dictionary or `wrd_lst_len`. Note that the inner most three loops do not contribute meaningfully to the big O as they only loop through 5 letters (a constant). 

Your task is to convert the algorithm that finds three words with no overlapping letters to using bit sets instead of the current approach. This will speed up the code without changing the big O! My solution code runs in about 2 seconds instead of 6 (what a speed up!).  

If you get stuck try the following:
1. Read through these specifications and the starter code carefully. Feel free to add your own comments as you develop a plan. You will need to adjust earlier code as well, not just the three nested loops.

2. Once you have some code, use the debugger to step through each part slowly. Think critically about what you expect the code to do and then see if that is what is actually happening based on the debugger output.

3. If you get stuck (30+ minutes of no progress), post on campuswire or come to office hours. This will take longer than getting the answer from AI but it has two benefits. 
    a. You will get a hint to get unstuck instead of just the answer. This will help you actually learn the skills you need.

    b. You will network with the professor, course staff, and other students. These connections will be vital in your schooling and career. It's also nice to connect with other humans! 

# Learning Goals
1. Gain an appreciation for how understanding a computer can help you speed up code. 
2. Be able to create and work with a bit set representation of data. 

# Background
A computer is built with logic gates which compose higher level simple operations like addition, bit shifting, and bit logic. These are often put together into more complex operations which a high level programming language can use. When you compile a C program, it turns the complex operations back into a series of simple operations that achieves the same logic. If your C code uses simple operations to start your program will run faster. This is because much of the code we write needs to be run sequentially and each operation needs time to run, so fewer operations == faster execution. 

The idea behind speeding up this code is that instead of using a high level algorithm to do set manipulation (finding if there is an intersection between the letters of two words) we can use low level operations on the bit level to do the same logic but with fewer machine instructions. 


# Task 0 - Finish MP 1.2
You will need a functioning MP 1.2 to get credit for this MP part. See the MP 1.2 specifications for details and the starter code. 

# Task 1 - Refactor the code to use bit sets
1. Note that logical operations like OR, XOR, and AND between two numbers is very fast on a computer.
2. Note that bit shifting a number is also very fast on a computer. 

Use these two notes and what we have learned about bit sets to refactor the code to improve the speed without changing the big O (you will still need three nested loops). 

# Logistics 

## Starter Code

[`mp3.2.zip`](../mp3.2.zip) contains the same starter files as MP 1.2. Unzip it on your computer into the `cs340` directory you created during the environment setup. Then, replace the mystery.c file in the new mp3.2 folder with the contents of your completed MP 1.2 mystery.c file. Additionally, you may want to copy over any .vscode files you changed to help with debugging. 

## Running the code 
Just like MP 1.2 we aren't including a makefile or other starter files. You may use AI/Search Engines for help in how to compile, run, and start the debugger in VS Code. Feel free to look at other released MPs, make your own Makefile, etc...

## Submitting and Grading
You can submit `mystery.c` as many times as you would like on Prairie Learn up to the deadline. I will grade the most recent submission. If you submit past the deadline, but within 24 hours, you will only receive up to 90% of the points. See the syllabus for more details. 

There are no public tests given or on Prairie Learn. In a week after the deadline you will recieve your grade for the work turned in on Prairie Learn. It will be graded all or nothing based on having ALL of the following,
1. It produces the correct results
2. It runs quicker than the working solution of MP 1.2
3. It uses bit sets but still has the time complexity of O(x^3)

Note - In theory you can improve this code further than just adding bit sets, please do not do so for this MP. 

## AI Policy
To get the most out of this MP and to avoid an academic integrity violation follow these rules for this MP. 

1. Do not feed AI/Search Engines any of the code in `mystery.c`. For example, do not look up: "How is this code using sets? **paste in code" or "How do I speed up code with using a bit set?". Instead, come to office hour or post on campuswire.

2. You may use AI/Search Engines to look up syntax. For example, you can look up: "How does the & operation work in C? Can you show me an example?" 

3. You may use AI/Search Engines to figure out how to compile, run, or run the debugger for `mystery.c`. For example, you can look up: "I'm using VS Code to run a C program. How do I set up the debugger so I can step through the code?" 

4. Office hours are always open to any questions!

** If you aren't sure what is allowed, feel free to ask on campus wire or office hours. **