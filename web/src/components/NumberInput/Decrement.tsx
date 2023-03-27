import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { IoCaretDown } from "react-icons/io5";

import { useNumberInputCtx } from "./Context";
import type { NumberInputDecrementButtonProps } from "./types";

export const NumberInputDecrementButton = forwardRef<
  HTMLButtonElement,
  NumberInputDecrementButtonProps
>((props, ref) => {
  const { getDecrementButtonProps } = useNumberInputCtx();
  const { children, className, ...other } = getDecrementButtonProps(props, ref);

  return (
    <Primitive.button
      {...other}
      ref={ref}
      className={clsx(
        "flex flex-1 cursor-pointer select-none items-center justify-center border-t border-l leading-[normal] transition",

        "disabled:cursor-not-allowed disabled:text-muted/60",

        className
      )}
    >
      {children ?? <IoCaretDown />}
    </Primitive.button>
  );
});

NumberInputDecrementButton.displayName = "NumberInputDecrementButton";
