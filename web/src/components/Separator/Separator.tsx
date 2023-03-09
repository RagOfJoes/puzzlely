import type { ComponentProps } from "react";

export function Separator(props: ComponentProps<"hr">) {
  return (
    <hr
      {...props}
      role="separator"
      className="h-[1px] w-full bg-gradient-to-r from-base via-subtle to-base"
    />
  );
}
