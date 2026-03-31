# Testing Guide

This guide bridges the specification and your test code. It covers the
commands you can use as jobs, the scheduler flags available to you, the
structure of the results you get back, and how to reason about timing.

---

## Structure of a Test

Every test follows the same pattern:

```python
def test_something(scheduler_path: str) -> None:
    results = run_scheduler(
        scheduler_path,
        job_lines=[...],   # a list of strings specifying the jobs to run
        workers=4,         
        cpu_capacity=4,
    )
    # make assertions about results
    assert 1 == 1
```

`run_scheduler` handles everything else: writing the jobs file, invoking
the binary, parsing the output. You provide jobs and flags, you get back
results.

---

## Jobs You Can Use

A job is any shell command. These are the most useful ones for testing:

### `echo` — instant success
```
echo hello
echo "multiple words"
```
Exits immediately with code 0. Use when you need a job that succeeds
quickly and you do not care about timing.

### `sleep` — controlled duration
```
sleep 0.3
sleep 0.2
```
Runs for approximately the specified number of seconds, then exits with
code 0. Use when you need to control how long a job takes, essential
for timing-based tests. Please use values between 0.2 and 0.4 to keep 
your tests from taking too long to run. 

### `false` — instant failure
```
false
```
Exits immediately with code 1. Use when you need a job that produces
a FAIL result.


### Combining prefixes with commands
```
cpu=2 sleep 0.2          # takes 0.2s, consumes 2 CPU units
timeout=0.3 sleep 10     # sleep 10s but killed after 0.3s -> TIMEOUT
cpu=2 timeout=1.0 sleep 0.5   # both prefix fields
```

Prefixes can appear in either order:
```
timeout=1.0 cpu=2 sleep 0.5   # also valid
```
---

## Scheduler Flags

These are the parameters you pass to `run_scheduler`:

| Parameter | Default | What it controls |
|-----------|---------|-----------------|
| `workers` | 4 | Maximum number of jobs running at the same time |
| `cpu_capacity` | 4 | Total CPU units available across all running jobs |
| `timeout` | 5.0 | Default per-job timeout in seconds (overridden by `timeout=` prefix) |
| `expect_returncode` | None | If set, asserts the scheduler's exit code matches this value |


## The Results List

`run_scheduler` returns a list of `SchedulerResult` objects, one per job,
in the order they appear in `summary.json` (which should be ascending
job_id order).

### All fields in a SchedulerResult object

```python
job_id        # int   — position in the input file, starting from 0
cmd           # str   — the command (prefixes stripped)
cpu           # int   — CPU units requested
status        # str   — "SUCCESS", "FAIL", "TIMEOUT", or "UNSCHEDULABLE"
returncode    # int or None — process exit code, None if no normal exit
wall_time_s   # float — elapsed time in seconds
stdout_path   # str   — path to captured stdout file, or "" if none
stderr_path   # str   — path to captured stderr file, or "" if none
error         # str   — error message if any, otherwise ""
```

---

## Timing

Timing is how you test whether resource constraints were actually enforced.
The results list will often look correct (all jobs succeed) even on a broken
scheduler, but the time it took to produce those results reveals whether
the constraints were respected. 

### Measuring elapsed time

Wrap the `run_scheduler` call:

```python
import time

start = time.time()
results = run_scheduler(scheduler_path, job_lines, ...)
elapsed = time.time() - start
```

### How to reason about expected time

| Setup | Expected time |
|-------|--------------|
| N jobs of duration D, all fit concurrently (parallel in our computers) | ≈ D |
| N jobs of duration D, forced sequential (workers=1 or CPU constraint) | ≈ N × D |

**Example:** three `sleep 0.3` jobs

```
workers=4, cpu_capacity=8  ->  all run in parallel  ->  ~0.3s
workers=1, cpu_capacity=8  ->  sequential            ->  ~0.9s
workers=4, cpu_capacity=2, each job cpu=2  ->  sequential  ->  ~0.9s
```

### Writing timing assertions

Never assert an exact value — system load introduces variance.
Assert a range with comfortable margins:

```python
# Expect ~0.9s sequential — assert it took at least 0.7s
# A broken scheduler (running in parallel) would finish in ~0.3s
assert elapsed > 0.7, f"expected sequential execution, got {elapsed:.2f}s"

# Expect ~0.3s parallel — assert it finished in under 0.7s
# A broken scheduler (serializing unnecessarily) would take ~0.9s
assert elapsed < 0.7, f"expected parallel execution, got {elapsed:.2f}s"
```

A margin of ~0.2s is usually safe. Tighter margins cause flaky failures
on loaded machines.

### Per-job timing

Each result also has `wall_time_s` — the elapsed time for that individual job:

```python
r = get_by_id(results, 1)
# A job with timeout=0.3 should have wall_time_s close to 0.3
assert 0.1 < r.wall_time_s < 0.8
```

---

## Checking the Exit Code

The scheduler exits with 0 if all jobs succeeded, 1 if any job failed
or timed out. UNSCHEDULABLE jobs do not affect the exit code.

```python
# All jobs succeed -> exit 0
results = run_scheduler(
    scheduler_path, ["echo ok", "echo also_ok"],
    expect_returncode=0
)

# At least one job times out -> exit 1
results = run_scheduler(
    scheduler_path, ["echo ok", "timeout=0.1 sleep 10"],
    expect_returncode=1
)
```

If `expect_returncode` is set and the actual exit code does not match,
`run_scheduler` raises an `AssertionError` before returning results.

---
