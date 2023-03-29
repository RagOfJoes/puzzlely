import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import type { SidebarHeadingProps } from "./types";

export const SidebarHeading = forwardRef<
  ElementRef<typeof Primitive.h3>,
  SidebarHeadingProps
>((props, ref) => {
  const { children, className, ...other } = props;

  return (
    <Primitive.h3
      {...other}
      ref={ref}
      className={clsx(
        "w-full px-4 font-heading text-sm font-bold uppercase",

        "max-sm:px-[10px]",

        className
      )}
    >
      {children}
    </Primitive.h3>
  );
});

SidebarHeading.displayName = "SidebarHeading";
