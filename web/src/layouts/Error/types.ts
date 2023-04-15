import type { ComponentProps, ReactNode } from "react";

export type ErrorLayoutProps = ComponentProps<"main"> & {
  caption: string;
  icon: ReactNode;
  lead: string;
};
