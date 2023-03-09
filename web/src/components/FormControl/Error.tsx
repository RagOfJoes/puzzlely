import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { useFormControlContext } from "./Context";
import type { FormControlErrorProps } from "./types";

export const FormControlError = forwardRef<
  HTMLParagraphElement,
  FormControlErrorProps
>((props, ref) => {
  const { getErrorProps } = useFormControlContext();

  return <Primitive.p {...getErrorProps(props, ref)} />;
});

FormControlError.displayName = "FormControlError";
