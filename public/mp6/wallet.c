/**
 * A sorted array-based map.
 *
 * Get: O(log n)
 * Change: O(log n)
 * Insert: O(n)
 * Remove: not implemented
 */

#include <stdlib.h>
#include <limits.h>
#include <string.h>
#include "wallet.h"

typedef struct m_entry {
  const char *key;
  int val;
} m_entry;


void m_init(my_map *map) {
  map->capacity = 4;
  map->size = 0;
  map->array = malloc(sizeof(m_entry) * map->capacity);
}

void m_free(my_map *map) {
  free(map->array);
  map->size = 0;
  map->capacity = 0;
}

/**
 * Helper method, using binary search.
 *
 * If key is in the map, returns true and sets index_to_set to the index of the key in the array.
 * Otherwise, returns false and sets index_to_set to the index where it ought to appear if added.
 */
static bool m_find(const my_map *map, const char *key, int *index_to_set) {
  int low = 0, high = map->size;
  while (low < high) {
    int i = (low+high)>>1;
    int diff = strcmp(key, map->array[i].key);
    if (diff == 0){
      *index_to_set = i;
      return true;
    }
    if (diff < 0) low = i+1;
    else high = i;
  }
  *index_to_set = low;
  return false;
}

/**
 * If the key is in the map, returns its current value.
 * Otherwise, inserts it with value `def` and returns `def`.
 * 
 * Keys are not copied, nor are their memory freed by w_free.
 * It is the caller's responsibility to ensure that the key pointer
 * remains valid and points to the same sequence of characters
 * for the entire lifespan of the map.
 */
int m_setdefault(my_map *map, const char *key, int def) {
  int idx;
  //sets idx to the index of the key
  bool found = m_find(map, key, &idx);
  if (found) return map->array[idx].val;

  // make space if needed
  if (map->size == map->capacity) {
    map->capacity *= 2;
    map->array = realloc(map->array, sizeof(m_entry) * map->capacity);
  }
  // make a hole for the new entry
  for (int i = map->size; i>idx; i-=1){
    map->array[i] = map->array[i-1];
  }
  map->size += 1;

  // insert into array
  map->array[idx].key = key;
  map->array[idx].val = def;

  return def;
}

/**
 * If the key is in the map, sets its value to `val` and returns true.
 * Otherwise, does not modify the map and returns false.
 */
bool m_assign(my_map *map, const char *key, int val){
  int idx;
  bool found = m_find(map, key, &idx);
  if (found) {
    // found, change in place
    map->array[idx].val = val;
    return true;
  }
  return false;
}


/**
 * Modify a map entry by a given delta, conceptually like
 * 
 * if key not in map, map[key] = 0
 * then, map[key] += delta
 * 
 * with the caveat that if the change would make the value negative,
 * the function blocks until that is no longer the case.
 * 
 * Returns the newly-assigned value.
 */
int wallet_use(my_map *map, const char *key, int delta){
  return 0;
}
