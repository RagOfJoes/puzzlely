import type { ComponentProps } from "react";

export type AuthLayoutProps = ComponentProps<"main"> & {
  caption: string;
  lead: string;
};
