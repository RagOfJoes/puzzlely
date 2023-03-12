import type { ReactNode } from "react";

import type { TopbarProps } from "@/components/Topbar";

export type MainLayoutProps = {
  asChild?: boolean;
  breadcrumbLinks: TopbarProps["links"];
  children?: ReactNode;
};
