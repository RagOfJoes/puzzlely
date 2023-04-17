import { forwardRef } from "react";

import type { SeparatorProps } from "./types";

export const Separator = forwardRef<HTMLHRElement, SeparatorProps>(
  (props, ref) => {
    return (
      <hr
        {...props}
        ref={ref}
        role="separator"
        className="h-[2px] w-full bg-gradient-to-r from-base via-muted/20 to-base"
      />
    );
  }
);

Separator.displayName = "Separator";
