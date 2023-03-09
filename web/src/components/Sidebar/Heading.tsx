import { forwardRef } from "react";

import clsx from "clsx";

import type { SidebarHeadingProps } from "./types";

export const SidebarHeading = forwardRef<
  HTMLHeadingElement,
  SidebarHeadingProps
>((props, ref) => {
  const { children, className, ...other } = props;

  return (
    <h3
      {...other}
      ref={ref}
      className={clsx(
        "w-full px-4 font-heading text-sm font-bold uppercase",

        "max-sm:px-[10px]",

        className
      )}
    >
      {children}
    </h3>
  );
});

SidebarHeading.displayName = "SidebarHeading";
