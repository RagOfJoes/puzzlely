import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { IoChevronDown } from "react-icons/io5";

import type { SelectTriggerProps } from "./types";

export const SelectTrigger = forwardRef<
  ElementRef<typeof Primitive.button>,
  SelectTriggerProps
>((props, ref) => {
  const { className, placeholder = "Select a filter", ...other } = props;

  return (
    <Select.Trigger
      {...other}
      ref={ref}
      className={clsx(
        "group flex h-10 items-center gap-2 rounded-md border bg-surface px-4 font-medium outline-none transition",

        "active:enabled:ring",
        'aria-[invalid="true"]:border-red',
        "data-[placeholder]:enabled:text-subtle",
        "disabled:cursor-not-allowed disabled:text-muted",
        "focus:enabled:ring",
        "focus-visible:enabled:ring",

        className
      )}
    >
      <span className="truncate">
        <Select.Value placeholder={placeholder} />
      </span>

      <Select.Icon>
        <IoChevronDown size={16} />
      </Select.Icon>
    </Select.Trigger>
  );
});

SelectTrigger.displayName = "SelectTrigger";
