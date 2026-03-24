CC      = gcc
CFLAGS  = -Wall -Wextra -O2 -pthread
TARGETS = scheduler_correct

.PHONY: all clean

all: $(TARGETS)

scheduler_correct: scheduler_correct.c scheduler_common.h
	$(CC) $(CFLAGS) -o $@ $<

clean:
	rm -f $(TARGETS)
