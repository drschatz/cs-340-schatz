/*
 * The tests in this file verify that you've added reader/writer lock behavior
 * to the map, both by checking correctness and by verifying realized parallelism.
 */
#include "wallet.h"
#include <stdio.h>
#include <stdlib.h>
#include <sys/times.h>

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

#define tcount 3
static pthread_t tid[tcount];

/**
 * Repeatedly accesses entries in the map, rarely adding a new one,
 * checking for incorrect behavior.
 * 
 * Accepts the index of this thread in [0,tcount) cast to a void*
 * and returns the number of failed checks cast to a void*
 */
void *worker(void *data) {
  size_t myid = (size_t)data;
  size_t failed = 0;
  int cnt = num/tcount;
  int off = (int)(cnt*myid);
  for(int i=0; i<cnt; i+=1) for(int k=0; k<cnt; k+=1) {
    for(int j=0; j<=i; j+=1) {
      if (!m_setdefault(&map, &keybank[stride*(off+j)], j==i))
        failed += 1;
      m_assign(&map, &keybank[stride*j*tcount], myid+10);
    }
  }
  return (void *)failed;
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

int main(int argc, char *argv[]) {
  struct tms clock_time;
  clock_t wall0 = times(&clock_time);

  int score = 0;
  int of = 0;
  m_init(&map);

  // make many keys
  make_keys(9);

  // process in several threads
  for(size_t i=0; i<tcount; i+=1)
    pthread_create(&tid[i], NULL, worker, (void *)i);

  for(int i=0; i<tcount; i+=1) {
    size_t err;
    pthread_join(tid[i], (void **)&err);
    of+=5; score += 5*check(0,err,"thread operating on map in parallel");
  }
  
  // check timing for 
  clock_t wall1 = times(&clock_time);
  of += 15;
  if ((wall1-wall0)*0.75 > clock_time.tms_utime) {
    printf("❌ practical parallelism (real: %ld, user: %ld)\n", (wall1-wall0), clock_time.tms_utime);
  } else {
    printf("✅ practical parallelism (real: %ld, user: %ld)\n", (wall1-wall0), clock_time.tms_utime);
    score += 15;
  }
  
  free(keybank);


  printf("RWLOCK TESTS SCORE: %d / %d\n", score, of);
  m_free(&map);
}
