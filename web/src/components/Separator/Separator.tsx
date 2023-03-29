import { forwardRef } from "react";

import type { SeparatorProps } from "./types";

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  (props, ref) => {
    return (
      <hr
        {...props}
        ref={ref}
        role="separator"
        className="h-[1px] w-full bg-gradient-to-r from-base via-subtle to-base"
      />
    );
  }
);

Separator.displayName = "Separator";
