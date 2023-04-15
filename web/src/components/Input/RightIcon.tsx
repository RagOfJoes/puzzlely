import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import type { InputRightIconProps } from "./types";

export const InputRightIcon = forwardRef<
  ElementRef<typeof Primitive.div>,
  InputRightIconProps
>((props, ref) => {
  const { children, className, ...other } = props;

  return (
    <Primitive.div
      {...other}
      ref={ref}
      className={clsx(
        "pointer-events-none absolute right-0 top-0 z-[2] flex h-10 w-10 items-center justify-center text-subtle",

        "peer-disabled:text-muted",

        className
      )}
    >
      {children}
    </Primitive.div>
  );
});

InputRightIcon.displayName = "InputRightIcon";
