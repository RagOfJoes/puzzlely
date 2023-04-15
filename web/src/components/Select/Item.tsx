import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { IoCheckmark } from "react-icons/io5";

import type { SelectListItemProps } from "./types";

export const SelectListItem = forwardRef<
  ElementRef<typeof Primitive.div>,
  SelectListItemProps
>((props, ref) => {
  const { children, className, disabled, ...other } = props;

  return (
    <Select.Item
      {...other}
      ref={ref}
      disabled={disabled}
      className={clsx(
        "relative flex h-10 select-none items-center gap-3 px-4 font-medium text-subtle outline-none",

        "data-[disabled]:pointer-events-none data-[disabled]:text-muted",
        "data-[highlighted]:bg-muted/10",
        "data-[state=checked]:font-bold data-[state=checked]:text-text",
        "hover:bg-muted/10",

        className
      )}
    >
      <Select.ItemText asChild>
        <p>{children}</p>
      </Select.ItemText>

      <Select.ItemIndicator>
        <IoCheckmark size={16} />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

SelectListItem.displayName = "SelectListItem";
