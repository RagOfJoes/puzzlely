import { forwardRef } from "react";

import clsx from "clsx";

import type { InputLeftIconProps } from "./types";

export const InputLeftIcon = forwardRef<HTMLDivElement, InputLeftIconProps>(
  (props, ref) => {
    const { children, className, ...other } = props;

    return (
      <div
        {...other}
        ref={ref}
        className={clsx(
          "pointer-events-none absolute left-0 top-0 z-[2] flex h-10 w-10 items-center justify-center text-subtle",

          "peer-disabled:text-muted",

          className
        )}
      >
        {children}
      </div>
    );
  }
);

InputLeftIcon.displayName = "InputLeftIcon";
