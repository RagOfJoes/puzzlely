import type { ElementRef, ReactNode } from "react";
import { useId, cloneElement, forwardRef, Children, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import * as RadixSelect from "@radix-ui/react-select";

import { useFormControlProps } from "@/components/FormControl";
import useControllableState from "@/hooks/useControllableState";
import omit from "@/lib/omit";
import pick from "@/lib/pick";

import type { SelectProps } from "./types";

export const Select = forwardRef<ElementRef<typeof Primitive.div>, SelectProps>(
  (props, ref) => {
    const {
      children,
      className,
      onValueChange: onValueChangeProp,
      value: valueProp,
      ...other
    } = props;

    const id = useId();
    const ctx = useFormControlProps({
      ...pick(props, ["disabled", "invalid", "required"]),
    });

    const [value, setValue] = useControllableState({
      onChange: onValueChangeProp,
      value: valueProp,
    });

    // Filter children and ensure that the render order is correct
    const { trigger, list } = useMemo(() => {
      const c: { trigger?: ReactNode; list?: ReactNode } = {};

      Children.toArray(children).forEach((child: any) => {
        switch (child?.type?.displayName) {
          case "SelectTrigger":
            // Pass invalid state to trigger child
            c.trigger = cloneElement(child, {
              id: ctx?.id ?? id,
              "aria-invalid": ctx?.invalid ? "true" : "false",
            });
            break;
          case "SelectList":
            c.list = child;
            break;
          default:
            break;
        }
      });

      return c;
    }, [children, ctx?.id, ctx?.invalid, id]);

    return (
      // eslint-disable-next-line react/jsx-pascal-case
      <Primitive.div ref={ref} className={className}>
        <RadixSelect.Root
          {...omit(other, ["disabled", "required"])}
          {...omit(ctx, ["invalid", "readOnly"])}
          value={value}
          onValueChange={setValue}
        >
          {trigger}

          {list}
        </RadixSelect.Root>
      </Primitive.div>
    );
  }
);

Select.displayName = "Select";
