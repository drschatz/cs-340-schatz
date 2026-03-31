import sys
import time
from typing import List

from scheduler_test_harness import (
    run_scheduler,
    SchedulerResult,
)

# =============================================================================
# Write your tests below.
# Name each function test_* and give it a single parameter: scheduler_path.
# =============================================================================



# =============================================================================
# Test runner — do not modify below this line
# =============================================================================

def collect_tests():
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
    ap = argparse.ArgumentParser(
        description="Scheduler test runner",
        usage="python3 tests.py <scheduler> [scheduler2 ...]"
    )
    ap.add_argument(
        "schedulers",
        nargs="*",
        help="One or more paths to scheduler binaries (e.g. ./scheduler_a ./scheduler_b)"
    )
    args = ap.parse_args()

    if not args.schedulers:
        ap.print_help()
        sys.exit(1)

    if len(args.schedulers) == 1:
        # Single scheduler — verbose output
        run_against(args.schedulers[0], verbose=True)
    else:
        # Multiple schedulers — summary table
        tests = collect_tests()
        test_names = [name for name, _ in tests]
        all_results = {}

        for sched in args.schedulers:
            all_results[sched] = run_against(sched, verbose=False)

        # Print summary table
        print(f"\n{'Scheduler':<20}", end="")
        for name in test_names:
            short = name.replace("test_", "")[:10]
            print(f"  {short:<10}", end="")
        print(f"  {'TOTAL':>6}")
        print("-" * (20 + 12 * len(test_names) + 10))

        for sched, results in all_results.items():
            label = os.path.basename(sched)
            print(f"{label:<20}", end="")
            for name in test_names:
                sym = "  PASS    " if results.get(name) else "  FAIL    "
                print(f"{sym:<12}", end="")
            passed = sum(results.values())
            print(f"  {passed:>4}/{len(test_names)}")
        print()


if __name__ == "__main__":
    import os
    main()
