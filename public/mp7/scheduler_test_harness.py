#Do not edit! You also don't need to look at this file at all.

import json
import os
import subprocess
import tempfile
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class SchedulerResult:
    """One entry from summary.json. Field names match the spec exactly."""
    job_id: int
    cmd: str
    cpu: int
    status: str                 # SUCCESS | FAIL | TIMEOUT | UNSCHEDULABLE
    returncode: Optional[int]   # None for TIMEOUT / UNSCHEDULABLE
    wall_time_s: float
    stdout_path: str
    stderr_path: str
    error: str


def make_jobs_file(lines: List[str], path: str) -> None:
    """
    Write a jobs file to `path`.

    `lines` is a list of strings, one per job (or comment or blank).
    Example:
        make_jobs_file([
            "# my test jobs",
            "cpu=2 sleep 1",
            "echo hello",
        ], "/tmp/test_jobs.txt")
    """
    with open(path, "w", encoding="utf-8") as f:
        for line in lines:
            f.write(line + "\n")


def run_scheduler(
    scheduler_path: str,
    job_lines: List[str],
    workers: int = 4,
    cpu_capacity: int = 4,
    timeout: float = 5.0,
    shell: bool = False,
    expect_returncode: Optional[int] = None,
) -> List[SchedulerResult]:
    """
    Run a scheduler binary against a set of jobs and return parsed results.

    Parameters
    ----------
    scheduler_path : str
        Path to the scheduler binary, e.g. "./scheduler_a"
    job_lines : list of str
        Lines to write into the jobs file. Same format as the spec.
    workers : int
        Passed as --workers
    cpu_capacity : int
        Passed as --cpu-capacity
    timeout : float
        Passed as --timeout (default per-job timeout)
    shell : bool
        If True, passes --shell flag to the scheduler
    expect_returncode : int or None
        If provided, asserts the scheduler's exit code matches this value.
        Use 0 to assert all jobs succeeded, 1 to assert at least one failed.

    Returns
    -------
    list of SchedulerResult
        Parsed contents of summary.json, one object per job.

    Raises
    ------
    AssertionError
        If the scheduler exits with an unexpected returncode (when
        expect_returncode is specified), or if summary.json is missing
        or malformed.
    RuntimeError
        If the scheduler binary cannot be found or executed.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        jobs_file = os.path.join(tmpdir, "jobs.txt")
        summary_file = os.path.join(tmpdir, "summary.json")
        out_dir = os.path.join(tmpdir, "out")

        make_jobs_file(job_lines, jobs_file)

        cmd = [
            scheduler_path,
            jobs_file,
            "--workers", str(workers),
            "--cpu-capacity", str(cpu_capacity),
            "--timeout", str(timeout),
            "--out", out_dir,
            "--summary", summary_file,
        ]
        if shell:
            cmd.append("--shell")

        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
            )
        except FileNotFoundError:
            raise RuntimeError(
                f"Scheduler binary not found: {scheduler_path}\n"
                f"Make sure it is compiled and the path is correct."
            )

        if expect_returncode is not None:
            assert proc.returncode == expect_returncode, (
                f"Expected exit code {expect_returncode}, "
                f"got {proc.returncode}.\n"
                f"stderr: {proc.stderr[:500]}"
            )

        assert os.path.exists(summary_file), (
            f"summary.json was not created by {scheduler_path}.\n"
            f"stderr: {proc.stderr[:500]}"
        )

        with open(summary_file, "r", encoding="utf-8") as f:
            raw = json.load(f)

        results = []
        for entry in raw:
            results.append(SchedulerResult(
                job_id=entry["job_id"],
                cmd=entry["cmd"],
                cpu=entry["cpu"],
                status=entry["status"],
                returncode=entry.get("returncode"),
                wall_time_s=entry["wall_time_s"],
                stdout_path=entry["stdout_path"],
                stderr_path=entry["stderr_path"],
                error=entry.get("error", ""),
            ))

        return results


def assert_statuses(results: List[SchedulerResult], expected: List[str]) -> None:
    """
    Assert that the statuses of results match expected, in job_id order.

    Example:
        assert_statuses(results, ["SUCCESS", "TIMEOUT", "UNSCHEDULABLE"])
    """
    actual = [r.status for r in sorted(results, key=lambda r: r.job_id)]
    assert actual == expected, (
        f"Status mismatch.\n"
        f"  Expected: {expected}\n"
        f"  Got:      {actual}"
    )


def get_by_id(results: List[SchedulerResult], job_id: int) -> SchedulerResult:
    """Return the result with the given job_id. Raises if not found."""
    for r in results:
        if r.job_id == job_id:
            return r
    raise KeyError(f"No result with job_id={job_id}")
