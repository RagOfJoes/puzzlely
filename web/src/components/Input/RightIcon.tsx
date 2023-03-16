import { forwardRef } from "react";

import clsx from "clsx";

import type { InputRightIconProps } from "./types";

export const InputRightIcon = forwardRef<HTMLDivElement, InputRightIconProps>(
  (props, ref) => {
    const { children, className, ...other } = props;

    return (
      <div
        {...other}
        ref={ref}
        className={clsx(
          "pointer-events-none absolute right-0 top-0 z-[2] flex h-10 w-10 items-center justify-center text-subtle",

          "peer-disabled:text-muted",

          className
        )}
      >
        {children}
      </div>
    );
  }
);

InputRightIcon.displayName = "InputRightIcon";
