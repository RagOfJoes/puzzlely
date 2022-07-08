import { ReactNode, useMemo } from 'react';

import { Icon } from '@chakra-ui/react';
import { NextRouter } from 'next/router';
import { IoHome, IoExtensionPuzzle, IoBookmark } from 'react-icons/io5';

import { User } from '@/types/user';

// Links that will be visible to everybody
const links = [
  { path: '', section: true, title: 'Menu' },
  { path: '/', title: 'Home', icon: <Icon as={IoHome} /> },
  {
    path: '/puzzles',
    title: 'Puzzles',
    icon: <Icon as={IoExtensionPuzzle} />,
  },
];

// Links that will only be visible to authenticated users
const authLinks = [
  {
    path: '/puzzles/liked',
    title: 'Liked',
    icon: <Icon as={IoBookmark} />,
  },
];

const getSidebarLinks = (
  route: NextRouter,
  user?: User,
  overrideLink?: string
): {
  path: string;
  title: string;
  active?: boolean;
  section?: boolean;
  icon?: ReactNode;
}[] => {
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

      return { ...link, active: true };
    });
  }, [overrideLink, pathname, user]);
};

export default getSidebarLinks;
