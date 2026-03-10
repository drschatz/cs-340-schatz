/*
 * This test has several threads.
 * One periodically inserts large amounts of "$";
 * the others each try to convert "$" into something else,
 * some requiring a second resource as well.
 * This continues for a time and then stops and checks the results,
 * which are non-deterministic depending on which threads get the "$" first.
 * 
 * This test is used to measure that many threads can wait for the same resource,
 * and that the wallet method works as expected.
 */

#include "wallet.h"
#include <stdio.h>
#include <stdlib.h>
#include <sys/times.h>
#include <string.h>
#include <unistd.h>

bool done = false;
my_map map;


typedef struct { const char *account; const int delta; } wallet_tweak;
// given a special array of wallet_tweaks
// last has NULL account and 0 delta
void *wallet_user(void *data) {
  wallet_tweak *arr = data;
  size_t ever_negative = 0;
  while(!done) {
    for(int k=0; !done && arr[k].account; k+=1) { 
      if (wallet_use(&map, arr[k].account, arr[k].delta) < 0) ever_negative += 1;
      if (m_setdefault(&map, arr[k].account, 0) < 0) ever_negative += 1;
      usleep(100);
    }
  }
  return (void *)ever_negative;
}


#define tcount 20
static pthread_t tid[tcount];


int check(int expect, int got, const char *msg, const char *msg2) {
  if (expect == got) {
    printf("✅ %s %s\n", msg, msg2);
    return 1;
  } else {
    printf("❌ %s %s (expected %d, got %d)\n", msg, msg2, expect, got);
    return 0;
  }
}

int check_error(int got, const char *msg, const char *msg2) {
  if (!got) {
    printf("✅ %s %s\n", msg, msg2);
    return 1;
  } else {
    printf("❌ %s %s (%s)\n", msg, msg2, strerror(got));
    return 0;
  }
}

int balance() {
  int ans = 0;
  ans += 100*m_setdefault(&map,"$",0);
  ans += 200*m_setdefault(&map,"🥁",0);
  ans += 100*m_setdefault(&map,"🥜",0);
  ans +=  20*m_setdefault(&map,"🥡",0);
  ans += 300*m_setdefault(&map,"🧃",0);
  ans +=1500*m_setdefault(&map,"🦾",0);
  ans +=1000*m_setdefault(&map,"🦿",0);
  ans += 500*m_setdefault(&map,"🤖",0);
  ans +=  50*m_setdefault(&map,"🥐",0);
  ans +=  10*m_setdefault(&map,"🥟",0);
  ans += 500*m_setdefault(&map,"🥛",0);
  ans += 500*m_setdefault(&map,"🧀",0);
  return ans;
}

wallet_tweak rules[] = {
    {"$",-2}, {"🥁",1}, {NULL,0},
    {"$",-1}, {"🥜",1}, {NULL,0},
    {"$",-1}, {"🥡",5}, {NULL,0},
    {"$",-3}, {"🧃",1}, {NULL,0},
    {"$",-15}, {"🦾",1},{NULL,0},
    {"$",-10}, {"🦿",1},{NULL,0},
    {"$",-5}, {"🤖",1}, {NULL,0},
    {"$",-1}, {"🥐",2}, {NULL,0},
    {"$",-1}, {"🥟",10},{NULL,0},
    {"$",-5}, {"🥛",1}, {NULL,0},
    {"🥛",-1}, {"🧀",1}, {NULL,0},
};


int main(int argc, char *argv[]) {

  int score = 0;
  int of = 0;
  m_init(&map);

  m_setdefault(&map, "$", 0);
  for(int i=0; i<11; i+=1) {
    pthread_create(&tid[i], NULL, wallet_user, rules+(3*i));
    m_setdefault(&map, rules[3*i].account, 0);
  }

  for(int i=0; i<=10; i+=1) {
    if (i == 10) done = true;
    wallet_use(&map, "$", 100*(1+i));
    if (i == 10) wallet_use(&map, "🥛", 100);
    usleep(100000);
    if (i < 10) {
      of += 1; score += check((1+i)*(2+i)*5000, balance(), "intermediate", "balance");
    }
    if (i == 9) {
      of += 1; score += check(0, m_setdefault(&map,"🥛",0), "🥛", "balance should be 0 (all 🥛 becomes 🧀)");
    }
  }
  
  size_t negatives = 0;
  for(int i=0; i<11; i+=1) {
    of += 1; score += check_error(pthread_join(tid[i], (void **)&negatives), rules[3*i+1].account, "thread completes");
    of += 1; score += check(0, negatives, rules[3*i+1].account, "thread should not notice a negative value");
  }
  


  printf("FRENZY SCORE: %d / %d\n", score, of);


  m_free(&map);
}
