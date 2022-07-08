const REGEX = /\.0+$|(\.[0-9]*[1-9])0+$/;
const abbreviateNumber = (n: number): string => {
  if (n === 0) {
    return '0';
  }
  if (n < 1000) {
    return n.toString();
  }

  const item = [
    { value: 1e3, symbol: 'k' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ]
    .slice()
    .reverse()
    .find((i) => {
      return n >= i.value;
    });

  if (!item) {
    return '0';
  }
  return (n / item.value).toFixed(1).replace(REGEX, '$1') + item.symbol;
};

export default abbreviateNumber;
