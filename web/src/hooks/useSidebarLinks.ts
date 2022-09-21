import { useMemo } from 'react';

import { NextRouter } from 'next/router';
import { IconType } from 'react-icons';
import { IoHome, IoExtensionPuzzle, IoBookmark } from 'react-icons/io5';

import { User } from '@/types/user';

export type UseSidebarLinks = {
  icon?: IconType;
  isActive?: boolean;
  isSection?: boolean;
  path: string;
  title: string;
};

// Links that will be visible to everybody
const links: UseSidebarLinks[] = [
  { path: '', isSection: true, title: 'Menu' },
  { path: '/', title: 'Home', icon: IoHome },
  {
    path: '/puzzles',
    title: 'Puzzles',
    icon: IoExtensionPuzzle,
  },
];

// Links that will only be visible to authenticated users
const authLinks: UseSidebarLinks[] = [
  {
    path: '/puzzles/liked',
    title: 'Liked',
    icon: IoBookmark,
  },
];

const useSidebarLinks = (
  route: NextRouter,
  user?: User,
  overrideLink?: string
): UseSidebarLinks[] => {
  const { pathname } = route;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useMemo(() => {
    const split =
      typeof overrideLink === 'string'
        ? ['', overrideLink]
        : pathname.split('/');

    const mergedLinks = [...links];
    if (user) {
      mergedLinks.push(...authLinks);
    }

    return mergedLinks.map((link) => {
      const pathSplit = link.path.split('/');

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
  }, [overrideLink, pathname, user]);
};

export default useSidebarLinks;
