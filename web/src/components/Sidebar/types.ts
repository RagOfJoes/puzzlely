import { UrlObject } from 'url';

import { ReactNode } from 'react';

import { BoxProps } from '@chakra-ui/react';

export type SidebarProps = BoxProps & {
  containerProps?: BoxProps;
  icon?: JSX.Element;
  name: string;
};

export type SidebarItemProps = {
  href?: string | UrlObject;
  icon?: ReactNode;
  isActive?: boolean;
  isSection?: boolean;
  name: string;
  passHref?: boolean;
};
