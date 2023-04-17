import type { ElementRef } from "react";
import { Children, forwardRef, useMemo } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

import type { SelectListProps } from "./types";

export const SelectList = forwardRef<
  ElementRef<typeof Primitive.div>,
  SelectListProps
>((props, ref) => {
  const { children, className, ...other } = props;

  const items = useMemo(() => {
    return Children.toArray(children).filter((child: any) => {
      return child?.type?.displayName === "SelectListItem";
    });
  }, [children]);

  return (
    <Select.Portal>
      <Select.Content
        {...other}
        ref={ref}
        className={clsx(
          "z-10 overflow-hidden rounded-md border bg-surface shadow",

          className
        )}
      >
        <Select.ScrollUpButton className="flex h-6 items-center justify-center">
          <IoChevronUp />
        </Select.ScrollUpButton>

        <Select.Viewport className="">{items}</Select.Viewport>

        <Select.ScrollDownButton className="flex h-6 items-center justify-center">
          <IoChevronDown />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  );
});

SelectList.displayName = "SelectList";
