TESTS := $(patsubst %.c,%,$(wildcard tests/*.c))
CC := cc -Werror -Wall -g -I.

.PHONY: all test clean build

all: build

build: wallet.o $(TESTS)

clean:
	rm -f *.o *.gch $(TESTS)

wallet.o: wallet.c wallet.h
	$(CC) -c $< -o $@

tests/%: tests/%.c wallet.o
	$(CC) $^ -o $@

test:
	python3 tests.py
