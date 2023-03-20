function uniqueBy<K, V>(list: Array<V>, key: (item: V) => K) {
  const seen = new Set();
  return list.filter((item) => {
    const k = key(item);
    return seen.has(k) ? false : seen.add(k);
  });
}

export default uniqueBy;
