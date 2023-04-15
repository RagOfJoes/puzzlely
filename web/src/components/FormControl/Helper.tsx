import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { useFormControlCtx } from "./Context";
import type { FormControlHelperProps } from "./types";

export const FormControlHelper = forwardRef<
  ElementRef<typeof Primitive.p>,
  FormControlHelperProps
>((props, ref) => {
  const { getHelperProps } = useFormControlCtx();

  return <Primitive.p {...getHelperProps(props, ref)} />;
});

FormControlHelper.displayName = "FormControlHelper";
