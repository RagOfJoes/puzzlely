import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";
import type Link from "next/link";

export type SidebarProps = ComponentPropsWithoutRef<typeof Primitive.nav> & {
  isOpen?: boolean;
};

export type SidebarHeadingProps = ComponentPropsWithoutRef<typeof Primitive.h3>;

export type SidebarItemProps = ComponentPropsWithoutRef<typeof Link> & {
  isActive?: boolean;
};

export type SidebarIconProps = ComponentPropsWithoutRef<typeof Primitive.div>;
