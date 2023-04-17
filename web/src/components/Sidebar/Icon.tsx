import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import type { SidebarIconProps } from "./types";

export const SidebarIcon = forwardRef<
  ElementRef<typeof Primitive.div>,
  SidebarIconProps
>((props, ref) => {
  const { children, className, ...other } = props;

  return (
    <Primitive.div
      {...other}
      ref={ref}
      className={clsx(
        "flex h-7 w-7 items-center justify-center rounded-lg border bg-surface text-cyan",

        "group-aria-[current=page]:border-none group-aria-[current=page]:bg-cyan group-aria-[current=page]:text-surface group-aria-[current=page]:shadow-sm",

        className
      )}
    >
      {children}
    </Primitive.div>
  );
});

SidebarIcon.displayName = "SidebarIcon";
