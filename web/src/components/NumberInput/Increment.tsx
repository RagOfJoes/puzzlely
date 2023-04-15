import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { IoCaretUp } from "react-icons/io5";

import { useNumberInputCtx } from "./Context";
import type { NumberInputIncrementButtonProps } from "./types";

export const NumberInputIncrementButton = forwardRef<
  ElementRef<typeof Primitive.button>,
  NumberInputIncrementButtonProps
>((props, ref) => {
  const { getIncrementButtonProps } = useNumberInputCtx();
  const { children, className, ...other } = getIncrementButtonProps(props, ref);

  return (
    <Primitive.button
      {...other}
      ref={ref}
      className={clsx(
        "flex flex-1 cursor-pointer select-none items-center justify-center border-l leading-[normal] transition",

        "disabled:cursor-not-allowed disabled:text-muted/60",

        className
      )}
    >
      {children ?? <IoCaretUp />}
    </Primitive.button>
  );
});

NumberInputIncrementButton.displayName = "NumberInputIncrementButton";
