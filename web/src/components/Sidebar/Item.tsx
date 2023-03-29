import type { ElementRef, ReactNode } from "react";
import React, { useMemo, Children, forwardRef } from "react";

import clsx from "clsx";
import Link from "next/link";

import type { SidebarItemProps } from "./types";

export const SidebarItem = forwardRef<
  ElementRef<typeof Link>,
  SidebarItemProps
>((props, ref) => {
  const { children, href, isActive } = props;

  const { icon, other } = useMemo(() => {
    const c: {
      icon?: ReactNode;
      other: ReactNode[];
    } = { other: [] };

    Children.toArray(children).forEach((child: any) => {
      switch (child?.type?.displayName) {
        case "SidebarIcon":
          c.icon = child;
          break;
        default:
          c.other = [...c.other, child];
      }
    });

    return c;
  }, [children]);

  return (
    <Link
      ref={ref}
      href={href ?? ""}
      aria-current={isActive && "page"}
      className={clsx(
        "group flex h-16 w-full cursor-pointer select-none appearance-none items-center justify-start gap-3 whitespace-nowrap rounded-2xl px-4 py-3 outline-none transition duration-150 ease-linear",

        "aria-[current=page]:bg-surface",
        "dark:aria-[current=page]:shadow",
        "focus:bg-muted/10 focus:ring",
        "hover:bg-muted/10"
      )}
    >
      {icon}

      <p
        className={clsx(
          "my-auto text-sm font-semibold text-subtle",

          "group-aria-[current=page]:text-text"
        )}
      >
        {other}
      </p>
    </Link>
  );
});

SidebarItem.displayName = "SidebarItem";
