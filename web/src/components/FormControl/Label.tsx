import type { ElementRef } from "react";
import { forwardRef } from "react";

import * as Label from "@radix-ui/react-label";

import { useFormControlCtx } from "./Context";
import { FormControlStar } from "./Star";
import type { FormControlLabelProps } from "./types";

export const FormControlLabel = forwardRef<
  ElementRef<typeof Label.Root>,
  FormControlLabelProps
>((props, ref) => {
  const { asChild, children } = props;

  const { getLabelProps, required } = useFormControlCtx();

  return (
    <Label.Root {...getLabelProps(props, ref)}>
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
