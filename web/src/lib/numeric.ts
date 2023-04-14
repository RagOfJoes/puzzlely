export function clampValue(value: number, min: number, max: number) {
  if (value == null) {
    return value;
  }

  if (max < min) {
    // eslint-disable-next-line no-console
    console.warn("[clampValue]: max cannot be less than min");
  }

  return Math.min(Math.max(value, min), max);
}

export function countDecimalPlaces(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  let e = 1;
  let p = 0;
  while (Math.round(value * e) / e !== value) {
    e *= 10;
    p += 1;
  }

  return p;
}

function toNumber(value: any) {
  const num = Number.parseFloat(value);

  return typeof num !== "number" || Number.isNaN(num) ? 0 : num;
}

export function toPrecision(value: number, precision?: number) {
  let nextValue: string | number = toNumber(value);

  const scaleFactor = 10 ** (precision ?? 10);

  nextValue = Math.round(nextValue * scaleFactor) / scaleFactor;

  return precision ? nextValue.toFixed(precision) : nextValue.toString();
}
