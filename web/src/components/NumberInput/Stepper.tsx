import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import type { NumberInputStepperProps } from "./types";

export const NumberInputStepper = forwardRef<
  HTMLDivElement,
  NumberInputStepperProps
>((props, ref) => {
  const { className, ...other } = props;

  return (
    <Primitive.div
      {...other}
      ref={ref}
      aria-hidden={true}
      className={clsx(
        "absolute top-0 right-0 z-[1] m-[1px] flex h-[calc(100%-2px)] w-6 flex-col",

        className
      )}
    />
  );
});

NumberInputStepper.displayName = "NumberInputStepper";
