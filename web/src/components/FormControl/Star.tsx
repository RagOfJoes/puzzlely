import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import { useFormControlContext } from "./Context";
import type { FormControlStarProps } from "./types";

export const FormControlStar = forwardRef<
  HTMLSpanElement,
  FormControlStarProps
>((props, ref) => {
  const { children = "*", ...other } = props;

  const { disabled } = useFormControlContext();

  return (
    <Primitive.span
      {...other}
      ref={ref}
      className={clsx({
        "text-ofs-text-error": !disabled,
        "text-ofs-text-disabled": disabled,
      })}
    >
      {children}
    </Primitive.span>
  );
});

FormControlStar.displayName = "FormControlStar";
