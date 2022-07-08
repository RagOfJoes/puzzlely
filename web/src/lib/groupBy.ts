const groupBy = <K, V>(list: Array<V>, keyGetter: (key: V) => K) => {
  const map = new Map<K, Array<V>>();
  list.forEach((item) => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return Array.from(map.values());
};

export default groupBy;
