import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { IoCaretDown } from "react-icons/io5";

import { useNumberInputCtx } from "./Context";
import type { NumberInputDecrementButtonProps } from "./types";

export const NumberInputDecrementButton = forwardRef<
  ElementRef<typeof Primitive.button>,
  NumberInputDecrementButtonProps
>((props, ref) => {
  const { getDecrementButtonProps } = useNumberInputCtx();
  const { children, className, ...other } = getDecrementButtonProps(props, ref);

  return (
    <Primitive.button
      {...other}
      ref={ref}
      className={clsx(
        "flex flex-1 cursor-pointer select-none items-center justify-center border-l border-t leading-[normal] transition",

        "disabled:cursor-not-allowed disabled:text-muted/60",

        className
      )}
    >
      {children ?? <IoCaretDown />}
    </Primitive.button>
  );
});

NumberInputDecrementButton.displayName = "NumberInputDecrementButton";
