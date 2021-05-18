export function mapValues<K, V, R>(map: Map<K, V>, f: (v: V) => R): Map<K, R> {
  const newMap = new Map<K, R>();
  for (const [key, value] of map.entries()) {
    newMap.set(key, f(value));
  }
  return newMap;
}

export function mapKeys<K, V, R>(map: Map<K, V>, f: (k: K) => R): Map<R, V> {
  const newMap = new Map<R, V>();
  for (const [key, value] of map) {
    newMap.set(f(key), value);
  }
  return newMap;
}
