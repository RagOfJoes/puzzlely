import type {
  FocusEventHandler,
  InputHTMLAttributes,
  ReactNode,
  Ref,
} from "react";

import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

import type { UseCounterProps } from "@/hooks/useCounter";

export type NumberInputProps = UseCounterProps & {
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
  className?: string;
  /**
   * Whether the input should be disabled
   */
  disabled?: boolean;
  /**
   * If using a custom display format, this converts the default format to the custom format.
   */
  format?: (value: string | number) => string | number;
  /**
   * This is used to format the value so that screen readers
   * can speak out a more human-friendly value.
   *
   * It is used to set the `aria-valuetext` property of the input
   */
  getAriaValueText?: (value: string | number) => string;
  /**
   * The `id` to use for the number input field.
   */
  id?: string;
  /**
   * Hints at the type of data that might be entered by the user. It also determines
   * the type of keyboard shown to the user on mobile devices
   *
   * @default
   * "decimal"
   */
  inputMode?: InputHTMLAttributes<any>["inputMode"];
  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;
  /**
   * Whether the pressed key should be allowed in the input.
   * The default behavior is to allow DOM floating point characters defined by /^[Ee0-9+\-.]$/
   */
  isValidCharacter?: (value: string) => boolean;
  /**
   * The HTML `name` attribute used for forms
   */
  name?: string;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onFocus?: FocusEventHandler<HTMLInputElement>;
  onInvalid?: (
    message: "rangeOverflow" | "rangeUnderflow",
    value: string,
    valueAsNumber: number
  ) => void;
  /**
   * If using a custom display format, this converts the custom format to a format `parseFloat` understands.
   */
  parse?: (value: string) => string;
  /**
   * The pattern used to check the <input> element's value against on form submission.
   *
   * @default
   * "[0-9]*(.[0-9]+)?"
   */
  pattern?: InputHTMLAttributes<any>["pattern"];
  /**
   * If `true`, the input will be in readonly mode
   */
  readOnly?: boolean;
  /**
   * Whether the input is required
   */
  required?: boolean;
};

export type NumberInputFieldProps = ComponentPropsWithoutRef<
  typeof Primitive.input
>;

export type NumberInputStepperProps = ComponentPropsWithoutRef<
  typeof Primitive.div
>;

export type NumberInputDecrementButtonProps = ComponentPropsWithoutRef<
  typeof Primitive.button
>;

export type NumberInputIncrementButtonProps = ComponentPropsWithoutRef<
  typeof Primitive.button
>;

export type UseNumberInput = {
  getDecrementButtonProps: (
    props: NumberInputDecrementButtonProps,
    ref: Ref<HTMLButtonElement>
  ) => NumberInputDecrementButtonProps;
  getIncrementButtonProps: (
    props: NumberInputIncrementButtonProps,
    ref: Ref<HTMLButtonElement>
  ) => NumberInputIncrementButtonProps;
  getFieldProps: (
    props: NumberInputFieldProps,
    ref: Ref<HTMLInputElement>
  ) => NumberInputFieldProps;
  isDisabled?: boolean;
  isFocused?: boolean;
  isReadOnly?: boolean;
  value: string;
  valueAsNumber: number;
};
