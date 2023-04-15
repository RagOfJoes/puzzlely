import type { FocusEvent } from "react";
import { useMemo, useCallback, useRef, useState } from "react";

import useAttributeObserver from "@/hooks/useAttributeObserver";
import useCallbackRef from "@/hooks/useCallbackRef";
import useCounter from "@/hooks/useCounter";
import { mergeRefs } from "@/hooks/useMergeRefs";
import useSafeLayoutEffect from "@/hooks/useSafeLayoutEffect";
import useSpinner from "@/hooks/useSpinner";
import useUpdateEffect from "@/hooks/useUpdateEffect";

import type { NumberInputProps, UseNumberInput } from "./types";

const getStepFactor = <Event extends React.KeyboardEvent | React.WheelEvent>(
  event: Event
) => {
  let ratio = 1;
  if (event.metaKey || event.ctrlKey) {
    ratio = 0.1;
  }
  if (event.shiftKey) {
    ratio = 10;
  }

  return ratio;
};

const FLOATING_POINT_REGEX = /^[Ee0-9+\-.]$/;
function isFloatingPointNumericCharacter(character: string) {
  return FLOATING_POINT_REGEX.test(character);
}

function isValidNumericKeyboardEvent(
  event: React.KeyboardEvent,
  isValid: (key: string) => boolean
) {
  if (event.key == null) {
    return true;
  }

  const isModifierKey = event.ctrlKey || event.altKey || event.metaKey;
  const isSingleCharacterKey = event.key.length === 1;
  if (!isSingleCharacterKey || isModifierKey) {
    return true;
  }

  return isValid(event.key);
}

function useNumberInput(props: NumberInputProps) {
  const {
    "aria-describedby": ariaDescBy,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    disabled: disabledProp,
    format: formatValue,
    getAriaValueText: getAriaValueTextProp,
    id,
    inputMode = "decimal",
    invalid: invalidProp,
    isValidCharacter: isValidCharacterProp = isFloatingPointNumericCharacter,
    max = Number.MAX_SAFE_INTEGER,
    min = Number.MIN_SAFE_INTEGER,
    name,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    onInvalid: onInvalidProp,
    parse: parseValue,
    pattern = "[0-9]*(.[0-9]+)?",
    readOnly: readOnlyProp,
    required: requiredProp,
    step: stepProp = 1,
  } = props;

  const getAriaValueText = useCallbackRef(getAriaValueTextProp);
  const isValidCharacter = useCallbackRef(isValidCharacterProp);
  const onBlur = useCallbackRef(onBlurProp);
  const onFocusRef = useCallbackRef(onFocusProp);
  const onInvalid = useCallbackRef(onInvalidProp);

  const counter = useCounter(props);

  const [isFocused, setFocused] = useState(false);
  const isInteractive = !(readOnlyProp || disabledProp);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputSelectionRef = useRef<{
    start: null | number;
    end: null | number;
  } | null>(null);
  const incrementButtonRef = useRef<HTMLButtonElement>(null);
  const decrementButtonRef = useRef<HTMLButtonElement>(null);

  const sanitize = useCallback(
    (newValue: string) => {
      return newValue.split("").filter(isValidCharacter).join("");
    },
    [isValidCharacter]
  );

  const parse = useCallback(
    (newValue: string) => {
      return parseValue?.(newValue) ?? newValue;
    },
    [parseValue]
  );

  const format = useCallback(
    (newValue: string | number) => {
      return (formatValue?.(newValue) ?? newValue).toString();
    },
    [formatValue]
  );

  useUpdateEffect(() => {
    if (counter.valueAsNumber > max) {
      onInvalid?.(
        "rangeOverflow",
        format(counter.value),
        counter.valueAsNumber
      );
    } else if (counter.valueAsNumber < min) {
      onInvalid?.(
        "rangeOverflow",
        format(counter.value),
        counter.valueAsNumber
      );
    }
  }, [counter.valueAsNumber, counter.value, format, onInvalid]);

  /**
   * Sync state with uncontrolled form libraries like `react-hook-form`.
   */
  useSafeLayoutEffect(() => {
    if (!inputRef.current) {
      return;
    }
    const notInSync = inputRef.current.value !== counter.value;
    if (notInSync) {
      const parsedInput = parse(inputRef.current.value);
      counter.setValue(sanitize(parsedInput));
    }
  }, [parse, sanitize]);

  const increment = useCallback(
    (step = stepProp) => {
      if (isInteractive) {
        counter.increment(step);
      }
    },
    [counter, isInteractive, stepProp]
  );

  const decrement = useCallback(
    (step = stepProp) => {
      if (isInteractive) {
        counter.decrement(step);
      }
    },
    [counter, isInteractive, stepProp]
  );

  /**
   * Leverage the `useSpinner` hook to spin the input's value
   * when long press on the up and down buttons.
   *
   * This leverages `setInterval` internally
   */
  const spinner = useSpinner(increment, decrement);

  useAttributeObserver(
    incrementButtonRef,
    "disabled",
    spinner.stop,
    spinner.isSpinning
  );
  useAttributeObserver(
    decrementButtonRef,
    "disabled",
    spinner.stop,
    spinner.isSpinning
  );

  /**
   * The `onChange` handler filters out any character typed
   * that isn't floating point compatible.
   */
  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const evt = event.nativeEvent as InputEvent;
      if (evt.isComposing) {
        return;
      }

      const parsedInput = parse(event.currentTarget.value);

      counter.update(sanitize(parsedInput));

      inputSelectionRef.current = {
        start: event.currentTarget.selectionStart,
        end: event.currentTarget.selectionEnd,
      };
    },
    [parse, counter, sanitize]
  );

  const onFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      onFocusRef?.(event);

      if (!inputSelectionRef.current) {
        return;
      }

      /**
       * restore selection if custom format string replacement moved it to the end
       */
      // eslint-disable-next-line no-param-reassign
      event.target.selectionStart =
        inputSelectionRef.current.start ?? event.currentTarget.value?.length;
      // eslint-disable-next-line no-param-reassign
      event.currentTarget.selectionEnd =
        inputSelectionRef.current.end ?? event.currentTarget.selectionStart;
    },
    [onFocusRef]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.nativeEvent.isComposing) return;

      if (!isValidNumericKeyboardEvent(event, isValidCharacter)) {
        event.preventDefault();
      }

      /**
       * Keyboard Accessibility
       *
       * We want to increase or decrease the input's value
       * based on if the user the arrow keys.
       *
       * @see https://www.w3.org/TR/wai-aria-practices-1.1/#keyboard-interaction-17
       */
      const stepFactor = getStepFactor(event) * stepProp;

      const eventKey = event.key;

      const keyMap: Record<string, React.KeyboardEventHandler> = {
        ArrowUp: () => increment(stepFactor),
        ArrowDown: () => decrement(stepFactor),
        Home: () => counter.update(min),
        End: () => counter.update(max),
      };

      const action = keyMap[eventKey];

      if (action) {
        event.preventDefault();
        action(event);
      }
    },
    [isValidCharacter, stepProp, increment, decrement, counter, min, max]
  );

  /**
   * If user would like to use a human-readable representation
   * of the value, rather than the value itself they can pass `getAriaValueText`
   *
   * @see https://www.w3.org/TR/wai-aria-practices-1.1/#wai-aria-roles-states-and-properties-18
   * @see https://www.w3.org/TR/wai-aria-1.1/#aria-valuetext
   */
  const ariaValueText = useMemo(() => {
    const text = getAriaValueText?.(counter.value);
    if (text !== null) {
      return text;
    }

    const defaultText = counter.value.toString();
    // empty string is an invalid ARIA attribute value
    return !defaultText ? undefined : defaultText;
  }, [counter.value, getAriaValueText]);

  /**
   * Function that clamps the input's value on blur
   */
  const validateAndClamp = useCallback(() => {
    let next = counter.value as string | number;
    if (counter.value === "") return;

    const valueStartsWithE = /^[eE]/.test(counter.value.toString());

    if (valueStartsWithE) {
      counter.setValue("");
    } else {
      if (counter.valueAsNumber < min) {
        next = min;
      }
      if (counter.valueAsNumber > max) {
        next = max;
      }

      counter.cast(next);
    }
  }, [counter, max, min]);

  const onFieldBlur = useCallback(() => {
    setFocused(false);

    validateAndClamp();
  }, [setFocused, validateAndClamp]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  const spinUp = useCallback(
    (event: any) => {
      event.preventDefault();

      spinner.up();

      focusInput();
    },
    [focusInput, spinner]
  );

  const spinDown = useCallback(
    (event: any) => {
      event.preventDefault();

      spinner.down();

      focusInput();
    },
    [focusInput, spinner]
  );

  const getIncrementButtonProps: UseNumberInput["getIncrementButtonProps"] =
    useCallback(
      (incrementButtonProps, ref) => {
        const disabled = disabledProp || counter.isAtMax;

        return {
          ...incrementButtonProps,
          ref: mergeRefs(ref, incrementButtonRef),
          "aria-disabled": disabled,
          disabled,
          onPointerDown: (e) => {
            incrementButtonProps.onPointerDown?.(e);

            if (e.button !== 0 || disabled) {
              return;
            }

            spinUp(e);
          },
          onPointerLeave: (e) => {
            incrementButtonProps.onPointerLeave?.(e);

            spinner.stop();
          },
          onPointerUp: (e) => {
            incrementButtonProps.onPointerUp?.(e);

            spinner.stop();
          },
          tabIndex: -1,
        };
      },
      [counter.isAtMax, disabledProp, spinUp, spinner]
    );

  const getDecrementButtonProps: UseNumberInput["getIncrementButtonProps"] =
    useCallback(
      (decrementButtonProps, ref) => {
        const disabled = disabledProp || counter.isAtMin;

        return {
          ...decrementButtonProps,
          ref: mergeRefs(ref, decrementButtonRef),
          "aria-disabled": disabled,
          disabled,
          onPointerDown: (e) => {
            decrementButtonProps.onPointerDown?.(e);

            if (e.button !== 0 || disabled) {
              return;
            }

            spinDown(e);
          },
          onPointerLeave: (e) => {
            decrementButtonProps.onPointerLeave?.(e);

            spinner.stop();
          },
          onPointerUp: (e) => {
            decrementButtonProps.onPointerUp?.(e);

            spinner.stop();
          },
          role: "button",
          tabIndex: -1,
        };
      },
      [counter.isAtMin, disabledProp, spinDown, spinner]
    );

  const getFieldProps: UseNumberInput["getFieldProps"] = useCallback(
    (fieldProps, ref) => ({
      id,
      "aria-describedby": ariaDescBy,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      inputMode,
      name,
      pattern,
      type: "text",
      disabled: disabledProp,

      ...fieldProps,

      "aria-invalid": invalidProp ?? counter.isOutOfRange,
      "aria-readonly": fieldProps.readOnly ?? readOnlyProp,
      "aria-required": fieldProps.required ?? requiredProp,
      "aria-valuemax": max,
      "aria-valuemin": min,
      "aria-valuenow": Number.isNaN(counter.valueAsNumber)
        ? undefined
        : counter.valueAsNumber,
      "aria-valuetext": ariaValueText,
      autoComplete: "off",
      autoCorrect: "off",
      onBlur: (e) => {
        fieldProps.onBlur?.(e);

        onBlur(e);

        onFieldBlur();
      },
      onChange: (e) => {
        fieldProps.onChange?.(e);

        onChange(e);
      },
      onFocus: (e) => {
        fieldProps.onFocus?.(e);

        onFocus(e);

        setFocused(true);
      },
      onKeyDown: (e) => {
        fieldProps.onKeyDown?.(e);

        onKeyDown(e);
      },
      readOnly: fieldProps.readOnly ?? readOnlyProp,
      ref: mergeRefs(inputRef, ref),
      required: fieldProps.required ?? requiredProp,
      role: "spinbutton",
      value: format(counter.value),
    }),
    [
      id,
      ariaDescBy,
      ariaLabel,
      ariaLabelledBy,
      inputMode,
      name,
      pattern,
      disabledProp,
      invalidProp,
      counter.isOutOfRange,
      counter.valueAsNumber,
      counter.value,
      readOnlyProp,
      requiredProp,
      max,
      min,
      ariaValueText,
      format,
      onBlur,
      onFieldBlur,
      onChange,
      onFocus,
      onKeyDown,
    ]
  );

  return {
    getDecrementButtonProps,
    getIncrementButtonProps,
    getFieldProps,
    isDisabled: disabledProp,
    isFocused,
    isReadOnly: readOnlyProp,
    value: format(counter.value),
    valueAsNumber: counter.valueAsNumber,
  };
}

export default useNumberInput;
