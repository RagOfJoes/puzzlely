import type { ComponentProps } from "react";

import type { TopbarProps } from "@/components/Topbar";

export type MainLayoutProps = ComponentProps<"main"> & {
  breadcrumbLinks: TopbarProps["links"];
};
