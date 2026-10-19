---
title: MP6
subtitle: Scheduler Tests
author: Jule Legende
---
In this Miso Potato (MP), you will write tests to verify the behavior of a CPU scheduler.

# Learning Goals

- Being able to comprehend and verify complex specifications through testing.
- Practice basic Python programming.
- Develop a deeper intuition of scheduling jobs on a computer system.

# Background

Operating systems and other internal software need schedulers to decide what to run when. Schedulers are responsible for managing when and where (what core) your processes run on. In class, we learned that the OS is responsible for scheduling processes and threads. The part of the OS that does this is called the scheduler. It decides when each process or thread runs and on which CPU core when, following a scheduling algorithm chosen by the OS developers. This is what allows the computer to run many processes and threads concurrently!

In this assignment you will NOT be writing scheduler code but instead verifying that scheduler code runs as expected by writing tests. Testing is an important part of being a programmer because in the real world it is your responsibility to assure your code works as expected. Additionally, in the world of AI you will often receive code you need to verify before pushing to production. This is to help you develop that skill. While in the real world you would have access to AI, to get the most learning out of this MP I recommend not using any AI. Not to help you parse the instructions, write tests, or verify your code. This will set you up for success in the real world by giving you strong background skills to use AI on top of.

# Initial Files

## Code

[`mp6.zip`](../mp6.zip) contains the necessary code files for completing the MP.

This includes a working (non-buggy) solution of a scheduler. You do not need to read or look at this file. Everything you need to complete the MP will be in the specifications. Your task is to write Python tests in `tests.py` to verify and check the behavior of scheduler implementations. You will only turn in `tests.py`.

The autograder will have multiple buggy versions of the scheduler which will be used to verify your tests could catch bugs. This autograder will be available during the whole process to help you know when you are done with the MP.

# Scheduler

The scheduler maintains a queue of processes, which we will call jobs. The scheduler wakes up every 0.1s to check which new jobs have arrived and to decide which job should run next. It keeps running until all jobs have completed and no new jobs have arrived.

The scheduler has a limited number of CPU cores to run jobs on. Each incoming job tells the scheduler: how many resources it needs (CPU cores), when it arrived, and how important it is (its priority). The scheduler uses this information to decide which jobs run and when.

This document specifies the scheduling algorithm, its command-line interface, its job file format, and its output file format.

## Scheduling Algorithm

This scheduler uses a fixed priority preemptive algorithm for deciding what jobs should run when. In this algorithm, jobs are scheduled based on their arrival time, CPU requirements, and priority. If applicable this may even involve preempting a currently running job.

**Preemption** - Pausing a currently running job to make room for another job. Eventually, the paused job will be scheduled back into the CPU to finish.

The scheduler maintains a queue of incoming unscheduled jobs sorted by each job’s priority, then by arrival time, then by job id. The scheduler goes through the queue trying to schedule as many jobs as possible given the following rules:

1. If the CPU requirements of the job exceed the max number of CPU resources the scheduler has, it marks the job unscheduleable before it even enters the job queue.
2. Going through the priority queue one job at a time,
    1. If there are enough open CPUs, schedule the job to start across all it’s needed CPUs. Note that a job cannot start on less CPUs than it requires.
    2. If there are not enough open CPUs for the job, search through current running jobs and count how many CPUs could be freed by preempting lower priority jobs. If enough CPUs could be freed to run the current, higher priority job, pause lower priority jobs (starting from the lowest priority) until there is enough space. Then schedule the original job across the CPUs it needs. Add the preempted jobs back to the queue and restart step 2.
3. Once the scheduler has gone through the queue and nothing can be scheduled, it waits for 0.1 seconds before waking up and trying again. At that point jobs may have finished and new jobs may have arrived.

### Example 1 - Same priorities different arrival times

!image_example1.png

### Example 2 - Different priorities no preemption

!image_example2.png

The scheduler woke up, and saw both of these jobs in the queue at the same time. It schedules the highest priority J1, and doesn’t have enough space to schedule J0, so J0 is scheduled after.

### Example 3 - Different priorities and preemption

image_example3.png

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
| arrival_time_s | float | Wall time, in seconds, when job was submitted to scheduler queue. |
| `start_time_s` | float | Wall time, in seconds, when job starts executing. |
| `end_time_s` | float | Wall time, in seconds, when the job completed and its resources were freed. |

- Note that timing on a computer is not exact. To find equivalency or comparisons between times use a small buffer. For example to see if two times are the same try, abs(time_b - time_a) ≤ 0.3 instead of (time_b == time_a).
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
3. Open and make a copy of the Worksheet.
    - TBD
4. Convert the scenarios into Python tests by writing code in `tests.py`. 
5. Run your tests locally. All your tests should pass locally:

```bash
make grade > output.txt
```

This command will produce the output from your tests into a file called output.txt

1. Submit `tests.py` to the autograder to see if you can catch the bugs in the buggy versions of the schedulers.
