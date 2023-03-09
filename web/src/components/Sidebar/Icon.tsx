import { forwardRef } from "react";

import clsx from "clsx";

import type { SidebarIconProps } from "./types";

export const SidebarIcon = forwardRef<HTMLDivElement, SidebarIconProps>(
  (props, ref) => {
    const { children, className, ...other } = props;

    return (
      <div
        {...other}
        ref={ref}
        className={clsx(
          "flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-cyan",

          "group-aria-[current=page]:bg-cyan group-aria-[current=page]:text-surface group-aria-[current=page]:shadow-sm",

          className
        )}
      >
        {children}
      </div>
    );
  }
);

SidebarIcon.displayName = "SidebarIcon";
