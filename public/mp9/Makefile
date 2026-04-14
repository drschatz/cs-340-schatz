.PHONY: test clean run

run: filter
	python3 filterService.py

filter: filter.c
	cc $^ -o $@ -lm

test: filter
	python3 scoring.py



clean:
	rm -f filter filter.o
	rm -rf __pycache__ .pytest_cache .mypy_cache
