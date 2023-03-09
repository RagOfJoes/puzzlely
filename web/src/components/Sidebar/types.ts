import type { ComponentProps } from "react";

export type SidebarProps = ComponentProps<"nav"> & {
  isOpen?: boolean;
};

export type SidebarHeadingProps = ComponentProps<"h3">;

export type SidebarItemProps = ComponentProps<"a"> & {
  isActive?: boolean;
};

export type SidebarIconProps = ComponentProps<"div">;
