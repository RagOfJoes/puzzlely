import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import { NumberInputProvider } from "./Context";
import type { NumberInputProps } from "./types";
import useNumberInput from "./useNumberInput";
import { useFormControlProps } from "../FormControl";

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(
  (props, ref) => {
    const controlProps = useFormControlProps(props);

    const ctx = useNumberInput(controlProps);

    return (
      <NumberInputProvider value={ctx}>
        <Primitive.div
          ref={ref}
          className={clsx(
            "relative z-0",

            props.className
          )}
        >
          {props.children}
        </Primitive.div>
      </NumberInputProvider>
    );
  }
);

NumberInput.displayName = "NumberInput";
