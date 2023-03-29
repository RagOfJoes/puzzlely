import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import { useFormControlCtx } from "./Context";
import type { FormControlStarProps } from "./types";

export const FormControlStar = forwardRef<
  ElementRef<typeof Primitive.span>,
  FormControlStarProps
>((props, ref) => {
  const { children = "*", ...other } = props;

  const { disabled } = useFormControlCtx();

  return (
    <Primitive.span
      {...other}
      ref={ref}
      className={clsx({
        "text-red": !disabled,
        "text-muted/60": disabled,
      })}
    >
      {children}
    </Primitive.span>
  );
});

FormControlStar.displayName = "FormControlStar";
