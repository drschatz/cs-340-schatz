#include "wallet.h"
#include <stdio.h>
#include <stdlib.h>

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
  my_map map;
  int score = 0;
  int of = 0;
  m_init(&map);

  of+=1; score += check(1234, m_setdefault(&map, "test", 1234), "setdefault on empty map");
  of+=1; score += check(1234, m_setdefault(&map, "test", -1), "setdefault on singleton map");
  of+=1; score += check(1234, m_setdefault(&map, "test", -1), "setdefault on present doesn't change");
  of+=1; score += check(-1, m_setdefault(&map, "tester", -1), "setdefault on new key");
  of+=1; score += check(-1, m_setdefault(&map, "tester", 1234), "setdefault on present key");
  of+=1; score += check(true, m_assign(&map, "tester", 340), "assign on present key");
  of+=1; score += check(false, m_assign(&map, "other", 340), "assign on absent key");
  of+=1; score += check(340, m_setdefault(&map, "tester", 1234), "setdefault after suceessful assign");
  of+=1; score += check(1234, m_setdefault(&map, "other", 1234), "setdefault after failing assign");
  m_setdefault(&map, "a", 0xa);
  m_setdefault(&map, "c", 0xc);
  m_setdefault(&map, "d", 0xd);
  m_setdefault(&map, "b", 0xb);
  m_setdefault(&map, "f", 0xf);
  m_setdefault(&map, "e", 0xe);
  of+=1; score += check(0xa, m_setdefault(&map, "a", 1234), "present");
  of+=1; score += check(0xb, m_setdefault(&map, "b", 1234), "present");
  of+=1; score += check(0xc, m_setdefault(&map, "c", 1234), "present");
  of+=1; score += check(0xd, m_setdefault(&map, "d", 1234), "present");
  of+=1; score += check(0xe, m_setdefault(&map, "e", 1234), "present");
  of+=1; score += check(0xf, m_setdefault(&map, "f", 1234), "present");
  of+=1; score += check(0xa, m_setdefault(&map, "a", 1234), "present");
  of+=1; score += check(225, m_setdefault(&map, "g", 225), "absent");
  m_assign(&map, "e", 0xeeee);
  of+=1; score += check(0xeeee, m_setdefault(&map, "e", 1234), "present and changed");
  
  // make many keys
  int log2 = 14;
  int stride = 1+(log2+3)/4;
  int num = 1<<log2;
  char *keybank = malloc(stride*num);
  for(int i=0; i<num; i+=1) {
    sprintf(keybank + (stride*i), "%0*x", stride-1, i);
  }
  
  // put them in the map in a strange order
  for(int i=0; i<num; i+=1) {
    int idx = (i*2531) & (num-1);
    m_setdefault(&map, keybank+(stride*idx), idx);
  }
  // get them out again in a different order
  int ok = 0;
  for(int i=0; i<num; i+=1) {
    int idx = (i*1565) & (num-1);
    ok += (idx == m_setdefault(&map, keybank+(stride*idx), -1));
  }
  of += 1; score += check(num, ok, "Large number of scrambled add and check");
  
  // modify in a third order
  for(int i=0; i<num; i+=1) {
    int idx = (i*967) & (num-1);
    m_assign(&map, keybank+(stride*idx), num-idx);
  }
  // check in a fourth order
  ok = 0;
  for(int i=0; i<num; i+=1) {
    int idx = (i*3129) & (num-1);
    ok += (num-idx == m_setdefault(&map, keybank+(stride*idx), -1));
  }
  of += 1; score += check(num, ok, "Large number of scrambled assign and check");
  
  free(keybank);


  printf("%d / %d\n", score, of);
  m_free(&map);
}
