import { HamburgerIcon } from '@chakra-ui/icons';
import {
  HStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  IconButton,
} from '@chakra-ui/react';
import Link from 'next/link';

import Search from './Search';
import Settings from './Settings';
import { TopbarProps } from './types';

const Topbar = (props: TopbarProps) => {
  const { links, onSearch, open, toggleOpen } = props;

  return (
    <HStack
      w="100%"
      p="20px"
      pt="12px"
      zIndex="1"
      as="header"
      align="center"
      justify="space-between"
    >
      <IconButton
        variant="ghost"
        colorScheme="gray"
        icon={<HamburgerIcon />}
        onClick={() => toggleOpen(!open)}
        display={{ sm: 'flex', lg: 'none' }}
        aria-label={
          open ? 'Close Side Navigation Bar' : 'Open Side Navigation Bar'
        }
      />

      <Breadcrumb
        spacing="8px"
        separator="/"
        fontWeight="400"
        display={{ base: 'none', lg: 'block' }}
        ms={{ base: '2', lg: '0px !important' }}
      >
        {links.map((link) => {
          const { path, title } = link;
          return (
            <BreadcrumbItem
              key={path}
              fontSize="md"
              fontWeight="medium"
              color="text.secondary"
            >
              <Link passHref href={path}>
                <BreadcrumbLink rel="nofollow">{title}</BreadcrumbLink>
              </Link>
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>

      <HStack>
        <Search onSearch={onSearch} />
        <Settings />
      </HStack>
    </HStack>
  );
};

export default Topbar;
