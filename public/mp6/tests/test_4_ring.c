/*
 * This test has a 256 threads.
 * Each one first decreases one value and then increases a different one,
 * in a big ring: one decreases "00" and increases "01";
 * the next decreases "01" and increases "02"; and so on up to
 * one decreases "FE" and increases "FF";
 * and the last creases "FF" and increases "00".
 * To start this all off, the main thread puts a 1 in "41"
 * and expects, once everything is settlted, to see a 1 in "40".
 * 
 * This test is used to measure that only the threads waiting on a given entry
 * are awakened when that entry changes. That is checked by runtime:
 * if more are awkened the entire process slows down.
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

#define tcount (1<<8)
static pthread_t tid[tcount];


void *wallet_user(void *data) {
  int cnt = PTR_X(data);
  int idx = PTR_Y(data);
  size_t bad = 0;
  for(int i=0; i<cnt; i+=1) {
    int temp1 = wallet_use(&map, &keybank[idx*stride], -1);
    int temp2 = wallet_use(&map, &keybank[((idx+1)%tcount)*stride], 1);
    if (temp1 < 0 ) bad += 1;
    if (temp2 < 0) bad += 1;
    if(temp2 < 1) bad +=1;
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
  make_keys(8);
  
  for(int i=0; i<tcount; i+=1) {
    pthread_create(&tid[i], NULL, wallet_user, AS_PTR(100,i));
  }
  wallet_use(&map, "41", 1);
  int join_error = 0;
  int negs = 0;
  for(int i=0; i<tcount; i+=1) {
    size_t negatives = 0;
    int res = pthread_join(tid[i], (void **)&negatives);
    if (res && !join_error) join_error = res;
    negs += negatives;
  }
  of += 1; score += check_error(join_error, "all threads should complete without error");
  of += 1; score += check(0, negs, "no thread should return a negative or wrong value");

  // check timing for 
  clock_t wall1 = times(&clock_time);
  of += 3;
  if ((wall1-wall0) > second) {
    printf("❌ separate condition variable for each entry (%g seconds)\n", (wall1-wall0) / (float) second);
  } else {
    printf("✅ separate condition variable for each entry (%g seconds)\n", (wall1-wall0) / (float) second);
    score += 3;
  }

  printf("RING SCORE: %d / %d\n", score, of);

  m_free(&map);
}
