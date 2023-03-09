import type { ReactNode } from "react";
import { useMemo } from "react";

import type { NextRouter } from "next/router";
import { IoHome, IoExtensionPuzzle, IoBookmark } from "react-icons/io5";

import type { User } from "@/types/user";

export type UseSidebarLink = {
  icon?: ReactNode;
  isActive?: boolean;
  isSection?: boolean;
  path: string;
  title: string;
};

// Links that will be visible to everybody
const DEFAULT_LINKS: UseSidebarLink[] = [
  { path: "", isSection: true, title: "Menu" },
  { path: "/", title: "Home", icon: IoHome({}) },
  {
    path: "/puzzles",
    title: "Puzzles",
    icon: IoExtensionPuzzle({}),
  },
];

// Links that will only be visible to authenticated users
const PROTECTED_LINKS: UseSidebarLink[] = [
  {
    path: "/puzzles/liked",
    title: "Liked",
    icon: IoBookmark({}),
  },
];

/**
 * Hook that generate sidebar links
 */
function useSidebarLinks(route: NextRouter, user?: User): UseSidebarLink[] {
  const { pathname } = route;

  return useMemo(() => {
    const split = pathname.split("/");

    const mergedLinks = [...DEFAULT_LINKS];
    if (user) {
      mergedLinks.push(...PROTECTED_LINKS);
    }

    return mergedLinks.map((link) => {
      const pathSplit = link.path.split("/");

      if (split.length !== pathSplit.length) {
        return link;
      }

      // eslint-disable-next-line no-cond-assign
      for (let i = split.length; (i -= 1); ) {
        if (split[i] !== pathSplit[i]) {
          return link;
        }
      }

      return { ...link, isActive: true };
    });
  }, [pathname, user]);
}

export default useSidebarLinks;
