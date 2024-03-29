import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import { useNumberInputCtx } from "./Context";
import type { NumberInputFieldProps } from "./types";

export const NumberInputField = forwardRef<
  ElementRef<typeof Primitive.input>,
  NumberInputFieldProps
>((props, ref) => {
  const { getFieldProps } = useNumberInputCtx();
  const { className, ...other } = getFieldProps(props, ref);

  return (
    <Primitive.input
      {...other}
      ref={ref}
      className={clsx(
        "relative h-10 w-full min-w-0 appearance-none rounded-lg border bg-surface px-4 outline-none transition",

        "aria-[invalid=true]:enabled::border-red",
        "disabled:cursor-not-allowed disabled:bg-muted/10 disabled:text-muted/60 disabled:placeholder:text-muted",
        "focus:enabled:ring",
        "placeholder:enabled:text-subtle",

        className
      )}
    />
  );
});

NumberInputField.displayName = "NumberInputField";
