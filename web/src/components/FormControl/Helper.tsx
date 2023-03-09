import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { useFormControlContext } from "./Context";
import type { FormControlHelperProps } from "./types";

export const FormControlHelper = forwardRef<
  HTMLParagraphElement,
  FormControlHelperProps
>((props, ref) => {
  const { getHelperProps } = useFormControlContext();

  return <Primitive.p {...getHelperProps(props, ref)} />;
});

FormControlHelper.displayName = "FormControlHelper";
