import type { ForwardedRef } from "react";

import type { LabelProps } from "@radix-ui/react-label";
import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

export type FormControlProps = ComponentPropsWithoutRef<
  typeof Primitive.div
> & {
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  required?: boolean;
};

export type FormControlLabelProps = LabelProps;

export type FormControlStarProps = ComponentPropsWithoutRef<
  typeof Primitive.span
>;

export type FormControlErrorProps = ComponentPropsWithoutRef<
  typeof Primitive.p
>;

export type FormControlHelperProps = ComponentPropsWithoutRef<
  typeof Primitive.p
>;

export type UseFormControl = {
  disabled?: boolean;
  errorID: string;
  hasError?: boolean;
  hasHelper?: boolean;
  helperID: string;
  getErrorProps: (
    props: FormControlErrorProps,
    ref: ForwardedRef<HTMLParagraphElement>
  ) => FormControlErrorProps & { ref: ForwardedRef<HTMLParagraphElement> };
  getHelperProps: (
    props: FormControlHelperProps,
    ref: ForwardedRef<HTMLParagraphElement>
  ) => FormControlHelperProps & { ref: ForwardedRef<HTMLParagraphElement> };
  getLabelProps: (props: FormControlLabelProps) => FormControlLabelProps;
  id: string;
  invalid?: boolean;
  labelID: string;
  readOnly?: boolean;
  required?: boolean;
};

export type UseFormControlProps = {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-readonly"?: boolean;
  "aria-required"?: boolean;
  disabled?: boolean;
  errorID?: string;
  helperID?: string;
  id?: string;
  invalid?: boolean;
  labelID?: string;
  readOnly?: boolean;
  required?: boolean;
};
