/*
 * This test has hundreds of pairs of threads, each operating as in the pingpong test
 * 
 * This test is used to measure that thredas can access values in parallel.
 * That is checked by runtime: parallel accesses are not permitted the entire process slows down.
 */

#include "wallet.h"
#include <stdio.h>
#include <stdlib.h>
#include <sys/times.h>
#include <string.h>
#include <unistd.h>

#define AS_PTR(x,y) ((void *)( (((long)x)<<32) | y ))
#define PTR_X(p) ((int)(((long)p)>>32))
#define PTR_Y(p) ((int)((long)p))


static int stride, num;
static char *keybank; // the ith (of num) unique key starts at keybank[i*stride]
/**
 * Initialize a large bank of unuiue keys (1<<log2 of them)
 */
static void make_keys(int log2) {
  stride = 1+(log2+3)/4;
  num = 1<<log2;
  keybank = malloc(stride*num);
  for(int i=0; i<num; i+=1) {
    sprintf(keybank + (stride*i), "%0*x", stride-1, i);
  }
}


my_map map;

#define tcount (1<<10)
static pthread_t tid[tcount];


void *wallet_user(void *data) {
  int cnt = PTR_X(data);
  int idx = PTR_Y(data);
  size_t bad = 0;
  for(int i=0; i<cnt; i+=1) {
    if (wallet_use(&map, &keybank[idx*stride], -1) < 0) bad += 1;
    int temp = wallet_use(&map, &keybank[(idx^1)*stride], 1);
    if (temp < 1) bad += 1;
  }
  return (void *)bad;
}



int check(int expect, int got, const char *msg) {
  if (expect == got) {
    printf("✅ %s\n", msg);
    return 1;
  } else {
    printf("❌ %s (expected %d, got %d)\n", msg, expect, got);
    return 0;
  }
}

int check_error(int got, const char *msg) {
  if (!got) {
    printf("✅ %s\n", msg);
    return 1;
  } else {
    printf("❌ %s (%s)\n", msg, strerror(got));
    return 0;
  }
}


int main(int argc, char *argv[]) {
  struct tms clock_time;
  clock_t wall0 = times(&clock_time);
  clock_t second = sysconf(_SC_CLK_TCK);

  int score = 0;
  int of = 0;
  m_init(&map);
  // make many keys
  make_keys(10);
  
  int join_error = 0;
  int negs = 0;


  for(int i=0; i<2; i+=1) {
    pthread_create(&tid[i], NULL, wallet_user, AS_PTR(511000,i));
  }
  for(int i=0; i<2; i+=2) {
    wallet_use(&map, &keybank[i*stride], 1);
  }
  for(int i=0; i<2; i+=1) {
    size_t negatives = 0;
    int res = pthread_join(tid[i], (void **)&negatives);
    if (res && !join_error) join_error = res;
    negs += negatives;
  }
  of += 1; score += check_error(join_error, "all threads should complete without error");
  of += 1; score += check(0, negs, "no thread should notice negative values");
  

  clock_t wall1 = times(&clock_time);
  printf("⌚ %g seconds for one 511,000-round ping-pong\n", (wall1-wall0)/(float)second);


  join_error = 0;
  negs = 0;

  for(int i=2; i<tcount; i+=1) {
    pthread_create(&tid[i], NULL, wallet_user, AS_PTR(1000,i));
  }
  for(int i=2; i<tcount; i+=2) {
    wallet_use(&map, &keybank[i*stride], 1);
  }
  for(int i=2; i<tcount; i+=1) {
    size_t negatives = 0;
    int res = pthread_join(tid[i], (void **)&negatives);
    if (res && !join_error) join_error = res;
    negs += negatives;
  }
  of += 1; score += check_error(join_error, "all threads should complete without error");
  of += 1; score += check(0, negs, "no thread should notice negative values");

  // check timing for 
  clock_t wall2 = times(&clock_time);
  printf("⌚ %g seconds for 511 parallel 1,000-round ping-pongs\n", (wall2-wall1)/(float)second);

  of += 6;
  if ((wall2-wall1) > (wall1-wall0)) {
    printf("❌ separate mutex for each entry (parallel should be faster)\n");
  } else {
    printf("✅ separate mutex for each entry (parallel should be faster)\n");
    score += 6;
  }

  printf("CROWDS SCORE: %d / %d\n", score, of);
  free(keybank);
  m_free(&map);
}
