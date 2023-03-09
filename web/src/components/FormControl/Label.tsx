import { forwardRef } from "react";

import * as Label from "@radix-ui/react-label";

import { useFormControlContext } from "./Context";
import { FormControlStar } from "./Star";
import type { FormControlLabelProps } from "./types";

export const FormControlLabel = forwardRef<
  HTMLLabelElement,
  FormControlLabelProps
>((props, ref) => {
  const { asChild, children } = props;

  const { getLabelProps, required } = useFormControlContext();

  return (
    <Label.Root {...getLabelProps(props)} ref={ref}>
      {asChild ? (
        children
      ) : (
        <>
          {children}

          {required && <FormControlStar />}
        </>
      )}
    </Label.Root>
  );
});

FormControlLabel.displayName = "FormControlLabel";
