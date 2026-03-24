import sys
import time
import traceback
from typing import List

from scheduler_test_harness import (
    run_scheduler,
    assert_statuses,
    get_by_id,
    SchedulerResult,
)

# =============================================================================
# Write your tests below.
# Name each function test_* and give it a single parameter: scheduler_path.
# =============================================================================

def test_simple(scheduler_path: str) -> None:
    results = run_scheduler(
        scheduler_path,
        job_lines=["echo hello", "echo world", "echo done"],
        workers=4,
        cpu_capacity=4,
    )
    assert len(results) == 3, f"expected 3 results, got {len(results)}"


# =============================================================================
# Test runner — do not modify below this line
# =============================================================================

SCHEDULERS = [
    "./scheduler_a",
    "./scheduler_b",
    "./scheduler_c",
    "./scheduler_d",
    "./scheduler_e",
    "./scheduler_f",
]


def collect_tests():
    import types
    current = sys.modules[__name__]
    tests = []
    for name in dir(current):
        if name.startswith("test_"):
            obj = getattr(current, name)
            if callable(obj):
                tests.append((name, obj))
    return sorted(tests)


def run_against(scheduler_path: str, verbose: bool = True) -> dict:
    tests = collect_tests()
    results = {}
    if verbose:
        print(f"\n{'='*60}")
        print(f"  Testing: {scheduler_path}")
        print(f"{'='*60}")

    for name, fn in tests:
        try:
            fn(scheduler_path)
            results[name] = True
            if verbose:
                print(f"  PASS  {name}")
        except Exception as e:
            results[name] = False
            if verbose:
                print(f"  FAIL  {name}")
                msg = str(e).split("\n")[0]
                print(f"        {msg}")

    passed = sum(results.values())
    total = len(results)
    if verbose:
        print(f"\n  {passed}/{total} tests passed")

    return results


def main():
    import argparse, os
    ap = argparse.ArgumentParser(description="Scheduler test runner")
    ap.add_argument("scheduler", nargs="?", help="Path to scheduler binary")
    ap.add_argument("--all", action="store_true", help="Run against all six schedulers")
    args = ap.parse_args()

    if args.all:
        tests = collect_tests()
        test_names = [name for name, _ in tests]
        all_results = {}

        for sched in SCHEDULERS:
            all_results[sched] = run_against(sched, verbose=False)

        print(f"\n{'Scheduler':<15}", end="")
        for name in test_names:
            short = name.replace("test_", "")[:10]
            print(f"  {short:<10}", end="")
        print(f"  {'TOTAL':>6}")
        print("-" * (15 + 12 * len(test_names) + 10))

        for sched, results in all_results.items():
            label = os.path.basename(sched)
            print(f"{label:<15}", end="")
            for name in test_names:
                sym = "  PASS    " if results.get(name) else "  FAIL    "
                print(f"{sym:<12}", end="")
            passed = sum(results.values())
            print(f"  {passed:>4}/{len(test_names)}")
        print()

    elif args.scheduler:
        run_against(args.scheduler, verbose=True)

    else:
        ap.print_help()
        sys.exit(1)


if __name__ == "__main__":
    import os
    main()
