import { useCallback } from "react";

import { clampValue, countDecimalPlaces, toPrecision } from "@/lib/numeric";

import useControllableState from "./useControllableState";

export type UseCounterProps = {
  /**
   * The initial value of the counter. Should be less than `max` and greater than `min`
   */
  defaultValue?: number | string;
  /**
   * The maximum value of the counter
   * @default Number.MAX_SAFE_INTEGER
   */
  max?: number;
  /**
   * The minimum value of the counter
   * @default Number.MIN_SAFE_INTEGER
   */
  min?: number;
  /**
   * The callback fired when the value changes
   */
  onChange?: (valueAsString: string, valueAsNumber: number) => void;
  /**
   * The number of decimal points used to round the value
   */
  precision?: number;
  /**
   * The step used to increment or decrement the value
   * @default 1
   */
  step?: number;
  /**
   * The value of the counter. Should be less than `max` and greater than `min`
   */
  value?: number | string;
};

function parse(value: string | number): number {
  return parseFloat(value.toString().replace(/[^\w.-]+/g, ""));
}

function getDecimalPlaces(value: number, step: number): number {
  return Math.max(countDecimalPlaces(step), countDecimalPlaces(value));
}

function cast(
  value: string | number,
  step: number,
  precision?: number
): string | undefined {
  const parsedValue = parse(value);
  if (Number.isNaN(parsedValue)) {
    return undefined;
  }

  const decimalPlaces = getDecimalPlaces(parsedValue, step);
  return toPrecision(parsedValue, precision ?? decimalPlaces);
}

export function useCounter(props: UseCounterProps = {}) {
  const {
    onChange: onChangeProp,
    precision: precisionProp,
    defaultValue,
    value: valueProp,
    step: stepProp = 1,
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
  } = props;

  const [value, setValue] = useControllableState({
    defaultValue,
    onChange:
      typeof onChangeProp === "function"
        ? (newValue) => {
            onChangeProp(newValue.toString(), parse(newValue));
          }
        : undefined,
    value: valueProp,
  });

  const decimalPlaces = getDecimalPlaces(parse(value), stepProp);

  const precision = precisionProp ?? decimalPlaces;

  const update = useCallback(
    (next: string | number) => {
      if (next === value) {
        return;
      }

      setValue(next);
    },
    [value, setValue]
  );

  // Function to clamp the value and round it to the precision
  const clamp = useCallback(
    (newValue: number) => {
      return toPrecision(clampValue(newValue, min, max), precision);
    },
    [precision, max, min]
  );

  const increment = useCallback(
    (step = stepProp) => {
      let parsed: number;

      if (value === "") {
        parsed = parse(step);
      } else {
        parsed = parse(value) + step;
      }

      update(clamp(parsed));
    },
    [clamp, stepProp, update, value]
  );

  const decrement = useCallback(
    (step = stepProp) => {
      let parsed: number;

      if (value === "") {
        parsed = parse(step);
      } else {
        parsed = parse(value) - step;
      }

      update(clamp(parsed));
    },
    [clamp, stepProp, update, value]
  );

  const reset = useCallback(() => {
    let casted: number | string;

    if (defaultValue == null) {
      casted = "";
    } else {
      casted = cast(defaultValue, stepProp, precisionProp) ?? min;
    }

    update(casted);
  }, [defaultValue, precisionProp, stepProp, update, min]);

  const castValue = useCallback(
    (newValue: string | number) => {
      update(cast(newValue, stepProp, precision) ?? min);
    },
    [precision, stepProp, update, min]
  );

  const valueAsNumber = parse(value);

  /**
   * Common range checks
   */
  const isAtMax = valueAsNumber === max;
  const isAtMin = valueAsNumber === min;
  const isOutOfRange = valueAsNumber > max || valueAsNumber < min;

  return {
    cast: castValue,
    clamp,
    decrement,
    increment,
    isAtMax,
    isAtMin,
    isOutOfRange,
    precision,
    reset,
    setValue,
    update,
    value,
    valueAsNumber,
  };
}
