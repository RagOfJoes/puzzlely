import type { ElementRef, ReactNode } from "react";
import { forwardRef, useMemo, Children } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import omit from "@/lib/omit";

import { FormControlProvider } from "./Context";
import type { FormControlProps } from "./types";
import useFormControl from "./useFormControl";

export const FormControl = forwardRef<
  ElementRef<typeof Primitive.div>,
  FormControlProps
>((props, ref) => {
  const { className, children } = props;

  const ctx = useFormControl(props);

  const { error, helper, label, other } = useMemo(() => {
    const c: {
      error?: ReactNode;
      helper?: ReactNode;
      label?: ReactNode;
      other: ReactNode[];
    } = { other: [] };

    Children.toArray(children).forEach((child: any) => {
      switch (child?.type?.displayName) {
        case "FormControlError":
          c.error = child;
          break;
        case "FormControlHelper":
          c.helper = child;
          break;
        case "FormControlLabel":
          c.label = child;
          break;
        // TODO: Filter out valid inputs
        default:
          c.other = [...c.other, child];
      }
    });

    return c;
  }, [children]);

  return (
    <FormControlProvider value={ctx}>
      <Primitive.div
        {...omit(props, [
          "className",
          "children",
          "disabled",
          "invalid",
          "readOnly",
          "required",
        ])}
        ref={ref}
        role="group"
        className={clsx(
          "flex flex-col",

          className
        )}
      >
        {label}

        {other}

        {error}
        {helper}
      </Primitive.div>
    </FormControlProvider>
  );
});

FormControl.displayName = "FormControl";
