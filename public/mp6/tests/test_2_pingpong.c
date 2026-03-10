/*
 * This test has two threads.
 * One increases ping and decreased pong;
 * the other decreased ping and increased pong.
 * The result should be a purely deterministic sequence of events;
 * the following repeated 1000 times:
 *     ping 0->1
 *     ping 1->0
 *     pong 0->1
 *     pong 1->0
 * 
 * This test is used to measure the basic wait-and-resume behavior
 * that condition variables provide.
 */

#include "wallet.h"
#include <stdio.h>
#include <stdlib.h>
#include <sys/times.h>
#include <string.h>

my_map map;

#define tcount 2
static pthread_t tid[tcount];

typedef struct { const char *account; const int delta; } wallet_tweak;
// given a special array of wallet_tweaks
// first has NULL account and number of repetions delta
// last has NULL account and 0 delta
void *wallet_user(void *data) {
  wallet_tweak *arr = data;
  size_t bad = 0;
  size_t one_count = 0;
  size_t zero_count = 0;

  for(int i=0; i<arr[0].delta; i+=1) {
    for(int k=1; arr[k].account; k+=1) {
      int temp = wallet_use(&map, arr[k].account, arr[k].delta);
      if (temp < 0) bad += 1;
      if (temp == 1) one_count += 1;
      if (temp == 0) zero_count += 1;
      if ((1|m_setdefault(&map, arr[k].account, 0)) != 1) bad += 1;
    }
  }
  if(one_count == 0 || zero_count == 0){
    bad += 1;
  }
  return (void *)bad;
}



int check(int expect, int got, const char *msg) {
  if (expect == got) {
    printf("✅ %s\n", msg);
    return 1;
  } else {
    printf("❌ %s\n", msg);
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


wallet_tweak ping[] = {{NULL,1000}, {"ping",1}, {"pong",-1}, {NULL,0}};
wallet_tweak pong[] = {{NULL,1000}, {"ping",-1}, {"pong",1}, {NULL,0}};

int main(int argc, char *argv[]) {

  int score = 0;
  int of = 0;
  m_init(&map);


  m_setdefault(&map, "ping",0);
  m_setdefault(&map, "pong",0);
  pthread_create(&tid[1], NULL, wallet_user, pong);
  pthread_create(&tid[0], NULL, wallet_user, ping);
  
  size_t negatives = 0;
  of += 1; score += check_error(pthread_join(tid[0], (void **)&negatives), "ping thread completes");
  of += 1; score += check(0, negatives, "ping should notice values of only 0 and 1");
  of += 1; score += check_error(pthread_join(tid[1], (void **)&negatives), "pong thread completes");
  of += 1; score += check(0, negatives, "pong should notice values of only 0 and 1");
  of += 1; score += check(0, m_setdefault(&map, "ping", 0), "ping balance");
  of += 1; score += check(0, m_setdefault(&map, "pong", 0), "pong balance");
  


  printf("PINGPONG SCORE: %d / %d\n", score, of);

  m_free(&map);
}
