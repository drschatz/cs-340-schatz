---
title: MP6
subtitle: Scheduler Tests
author: Jule Legende and Anton Dmitriev
---
In this Miso Potato (MP), you will write tests to verify the behavior of a CPU scheduler.

# Learning Goals

- Being able to comprehend and verify complex specifications through testing.
- Practice basic Python programming.
- Develop a deeper intuition of scheduling on a computer system.

# Background

Operating systems need schedulers to decide what runs when. In class, we learned that the OS is responsible for placing threads onto the CPU. Modern computers usually have multiple CPU cores, and each core can run a different thread at the same time. The part of the OS that decides what runs on which core is called the scheduler. Following a scheduling algorithm chosen by the OS developers, the scheduler decides when each thread runs and on which core. This is what allows a computer to run many processes and threads concurrently!

In this assignment you will not write scheduler code. Instead, you will verify that a scheduler works as expected by writing tests. Your tests will be run against one correct scheduler and many buggy ones. A good test suite passes the correct scheduler and fails every buggy one.

Testing is an important part of being a programmer, because in the real world it is your responsibility to ensure your code works as expected. In the world of AI, you will also often receive code that you need to verify before pushing it to production. This MP helps you build that skill. To get the most out of it, I recommend not using AI for any part of it: not to parse the instructions, not to write tests, and not to check your work.

# Initial Files

## Code

[`mp6.zip`](../mp6.zip) contains the necessary code files for completing the MP.

This includes a working (non-buggy) solution of a scheduler. You do not need to read or look at this file. Everything you need to complete the MP will be in the specifications. Your task is to write Python tests in `tests.py` to verify and check the behavior of scheduler implementations. You will only turn in `tests.py`.

The autograder will have multiple buggy versions of the scheduler which will be used to verify your tests catch bugs. This autograder will be available during the whole process to help you know when you are done with the MP.

# Scheduler

The scheduler maintains a queue of threads, which we will call jobs. The scheduler wakes up every 0.1s to check which new jobs have arrived and to decide which job should run next. It keeps running until all jobs have completed and no new jobs have arrived.

The scheduler has a limited number of CPU cores to run jobs on. Each incoming job tells the scheduler: how many resources it needs (CPU cores), when it arrived, and how important it is (its priority). The scheduler uses this information to decide which jobs run and when.

This document specifies the scheduling algorithm, its command-line interface, its job file format, and its output file format.

## Scheduling Algorithm

This scheduler uses a fixed priority preemptive algorithm for deciding what jobs should run when. In this algorithm, jobs are scheduled based on their arrival time, CPU requirements, and priority. If applicable this may even involve preempting a currently running job.

**Preemption** - Pausing a currently running job to make room for another job. Eventually, the paused job will be scheduled back into the CPU to finish.

The scheduler maintains a queue of incoming unscheduled jobs sorted by each job’s priority (higher means higher priority), then by arrival time, then by job id. The scheduler goes through the queue trying to schedule as many jobs as possible given the following rules:

1. If the CPU requirements of the job exceed the max number of CPU resources the scheduler has, it marks the job unschedulable before it even enters the job queue.
2. Going through the priority queue one job at a time:
    1. If there are enough open CPUs, schedule the job to start across all of its needed CPUs. Note that a job cannot start or run on fewer CPUs than it requires.
    2. If there are not enough open CPUs for the job, search through the currently running jobs and count how many CPUs could be freed by preempting lower priority jobs. If enough CPUs could be freed to run the current, higher priority job, preempt lower priority jobs (starting from the lowest priority) until there is enough space, preempting no more jobs than needed. Then schedule the original job across the CPUs it needs.
    3. Each preempted job is added back to the queue. It keeps its priority and arrival time and the progress it has already made, and it is scheduled like any other queued job. Its reported start time is the original time it first started, before it was preempted.
3. After a job is scheduled or preempted, go back to the top of the queue and repeat step 2. Continue until nothing can be scheduled.
4. Once the scheduler has gone through the queue and nothing can be scheduled, it waits for 0.1 seconds before waking up and trying again. At that point jobs may have finished and new jobs may have arrived.

### Example 1 - Same priorities different arrival times

![example 1 image](../image_1.webp)


### Example 2 - Different priorities no preemption

![example 2 image](../image_2.webp)

The scheduler woke up, and saw both of these jobs in the queue at the same time. It schedules the highest priority J1, and doesn’t have enough space to schedule J0, so J0 is scheduled after.

### Example 3 - Different priorities and preemption

![example 3 image](../image_3.webp)

# Testing Guide

This section covers how to run a job, the scheduler flags available to you, and the structure of the results you get back.

## Running The Scheduler

To run the scheduler we have provided a python function that takes in 3 parameters and returns a python list of the scheduling results. It is up to you to use this function along with assert statements to verify if the scheduler is following the desired behavior specified above.

```python
def run_scheduler(
    scheduler_path: str,
    job_lines: List[str],
    cpu_capacity: int = 4,
) -> List[SchedulerResult]:
```

| Parameter | Default | What it controls |
| --- | --- | --- |
| scheduler_path | “” | which scheduler to run |
| job_lines | “” | Jobs the scheduler runs. |
| cpu_capacity | 4 | Total CPU cores available across all running jobs. |

Each job in job_lines should be a string containing the following format,

```
[unique_ID=<int>] [cpu=<int>] [priority=<int>] [arrival_time=<float>] <command...>
```

- `unique_ID=<int>` — a value between 0 - 1000 indicating it’s unique job ID. These cannot be repeated within the same scheduling run.
- `cpu=<int>` — CPU units this job requires. Positive integer, default 1.
- `arrival_time=<float>` — the wall time that this job is submitted to the scheduler’s work queue.
- `priority=<int>` — a value between 0 and 10. Any job that appears in the queue with a higher (more positive) priority, will preempt a job with lower priority.
- `<command…>` will be ‘workload’ and some number between 1 and 10. 1 indicating the workload or job takes 1s to complete.

### Results List

After all jobs have been scheduled and run, the scheduler returns a list of lists of each of the jobs and how they ran. Each job’s result list will be formatted as,

| Field | Type | Description |
| --- | --- | --- |
| `job_id` | integer | Unique identifier for the job. |
| `cmd` | string | Command executed for the job. |
| cpu | integer | Number of CPUs used. |
| priority | integer | Priority job ran with. |
| `status` | enum | Job result: `SUCCESS`or `UNSCHEDULABLE`. |
| `arrival_time_s` | float | Wall time, in seconds, when job was submitted to scheduler queue. |
| `start_time_s` | float | Wall time, in seconds, when job starts executing. |
| `end_time_s` | float | Wall time, in seconds, when the job completed and its resources were freed. |

- Note that if a job is preempted, it’s (end_time_s - start_time_s) might be bigger than its workload.
- Note that if a job has a workload of 2 and needs 3 CPU cores to run and is not preempted (end_time_s - start_time_s) would be around 2 (not 3x2 or 6)

## Structure of a Test

Every test follows the same pattern:

```python
def test_something(scheduler_path: str) -> None:

    results = run_scheduler(
            scheduler_path,
            # a list of strings specifying the jobs to run
            job_lines=["unique_ID=0 cpu=2 priority=0 arrival_time=0 workload 2", 
                       "unique_ID=1 cpu=2 priority=5 arrival_time=1 workload 2"],
            # number of cores available
            cpu_capacity=2
            )
    
    # Some testing logic here checking the 'results' objects
    # Make assertions about results
    
    # Checks that at least one of the jobs has the ID of 0 as expected
    assert results[0][job_id] == "0" or results[1][job_id] == "0"
```

run_scheduler handles everything else: writing the jobs file, invoking the binary, parsing the output.

# Your Task

Note that while staff are happy to help, they will expect you to have followed these steps. For example, if you are missing a bug, the staff will ask to see your worksheet, not your `tests.py`.

## Scheduler Tests

1. Read through the these specifications carefully.
    - Take notes (without AI) on what behavior the scheduler should do.
    - You will come back to this often.
3. Open and make a copy of the [Worksheet](https://docs.google.com/document/d/1NlQTeP4MTEs-KRtYRFfq0FzCggbFPu3iqfZz5IR9NlM/edit?usp=sharing).
    - Fill in the worksheet with behaviors and scenarios.
4. Convert the scenarios into Python tests by writing code in `tests.py`. 
5. Run your tests locally. All your tests should pass locally:

```bash
make grade > output.txt
```

This command will produce the output from your tests into a file called output.txt

6. Submit `tests.py` to the autograder to see how many bugs your tests catch in buggy versions of the scheduler.

# AI Policy
To get the most out of this MP and to avoid an academic integrity violation follow these rules for this MP.

1. Do not use any AI for this MP.

** If you aren't sure what is allowed, feel free to ask on campus wire or office hours. **
