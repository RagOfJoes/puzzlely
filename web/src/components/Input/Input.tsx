import type { ElementRef, ReactNode } from "react";
import { Children, useMemo, forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import { useFormControlProps } from "@/components/FormControl";
import omit from "@/lib/omit";
import pick from "@/lib/pick";

import type { InputProps } from "./types";

export const Input = forwardRef<ElementRef<typeof Primitive.input>, InputProps>(
  (props, ref) => {
    const { children, className, placeholder = "...", ...other } = props;

    const ctx = useFormControlProps(
      pick(props, ["disabled", "id", "invalid", "readOnly", "required"])
    );

    const { leftIcon, rightIcon } = useMemo(() => {
      const c: { leftIcon?: ReactNode; rightIcon?: ReactNode } = {};

      Children.toArray(children).forEach((child: any) => {
        switch (child?.type?.displayName) {
          case "InputLeftIcon":
            c.leftIcon = child;
            break;
          case "InputRightIcon":
            c.rightIcon = child;
            break;
          default:
            break;
        }
      });

      return c;
    }, [children]);

    return (
      <div className="relative flex w-full font-medium">
        <Primitive.input
          {...omit(other, [
            "disabled",
            "id",
            "invalid",
            "readOnly",
            "required",
          ])}
          {...omit(ctx, ["invalid"])}
          ref={ref}
          className={clsx(
            "peer relative h-10 w-full min-w-0 appearance-none rounded-lg border bg-surface px-4 outline-none transition",

            "aria-[invalid=true]:enabled:border-red",
            "disabled:cursor-not-allowed disabled:bg-muted/10 disabled:text-muted/60 disabled:placeholder:text-muted",
            "focus:enabled:ring",
            "placeholder:enabled:text-subtle",

            {
              "pl-10": !!leftIcon,
              "pr-10": !!rightIcon,
            },

            className
          )}
          placeholder={placeholder}
        />

        {leftIcon}
        {rightIcon}
      </div>
    );
  }
);

Input.displayName = "Input";
