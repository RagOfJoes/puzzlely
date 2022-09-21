import React from 'react';

import {
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';

import styles from './styles';
import { SidebarItemProps } from './types';

const SidebarItem = (props: SidebarItemProps) => {
  const { href, icon, isActive, isSection, name, passHref } = props;

  const boxShadow = '0px 7px 11px rgba(0, 0, 0, 0.04)';
  const buttonHoverBg = useColorModeValue('gray.200', 'whiteAlpha.50');
  const iconBoxShadow = useColorModeValue('sm', '');

  if (isSection) {
    return <Heading {...(styles.itemSection as any)}>{name}</Heading>;
  }

  return (
    <Link href={href ?? ''} passHref={passHref}>
      <Button
        {...(styles.itemButton as any)}
        as="a"
        boxShadow={isActive ? boxShadow : 'none'}
        bgColor={isActive ? 'surface' : 'transparent'}
        _hover={{
          bg: !isActive && buttonHoverBg,
        }}
        _focus={{
          bg: !isActive && buttonHoverBg,
          boxShadow: isActive ? boxShadow : 'none',
        }}
      >
        {icon && (
          <Flex
            {...(styles.itemIcon as any)}
            bg={isActive ? 'primary' : 'surface'}
            color={isActive ? 'surface' : 'primary'}
            boxShadow={isActive ? '' : iconBoxShadow}
          >
            {icon}
          </Flex>
        )}

        <Text
          {...(styles.itemText as any)}
          color={isActive ? 'text.primary' : 'text.secondary'}
        >
          {name}
        </Text>
      </Button>
    </Link>
  );
};

export default SidebarItem;
