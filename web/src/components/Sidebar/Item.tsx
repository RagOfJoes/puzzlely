import { UrlObject } from 'url';

import React, { ReactNode } from 'react';

import {
  Button,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';

export type SidebarItemProps = {
  name: string;
  icon?: ReactNode;
  active?: boolean;
  section?: boolean;
  passHref?: boolean;
  href?: string | UrlObject;
};

const Item = (props: SidebarItemProps) => {
  const { active, href, icon, passHref, section, name } = props;

  const boxShadow = '0px 7px 11px rgba(0, 0, 0, 0.04)';
  const buttonHoverBg = useColorModeValue('gray.200', 'whiteAlpha.50');
  const iconBoxShadow = useColorModeValue('sm', '');

  if (section) {
    return (
      <Heading
        w="100%"
        pt="12px"
        size="xs"
        color="text.primary"
        textTransform="uppercase"
        ps={{ sm: '10px', xl: '16px' }}
      >
        {name}
      </Heading>
    );
  }
  return (
    <Link href={href ?? ''} passHref={passHref}>
      <Button
        as="a"
        w="100%"
        h="54px"
        py="12px"
        cursor="pointer"
        borderRadius="15px"
        alignItems="center"
        justifyContent="flex-start"
        transition="0.12s linear all"
        boxShadow={active ? boxShadow : 'none'}
        bgColor={active ? 'surface' : 'transparent'}
        mb={{ xl: '12px' }}
        mx={{ xl: 'auto' }}
        _hover={{
          bg: !active && buttonHoverBg,
        }}
        _focus={{
          bg: !active && buttonHoverBg,
          boxShadow: active ? boxShadow : 'none',
        }}
        _active={{
          bg: 'inherit',
          transform: 'none',
          borderColor: 'transparent',
        }}
      >
        {icon && (
          <Flex
            w="30px"
            h="30px"
            me="12px"
            borderRadius="8px"
            alignItems="center"
            justifyContent="center"
            bg={active ? 'primary' : 'surface'}
            color={active ? 'surface' : 'primary'}
            boxShadow={active ? '' : iconBoxShadow}
          >
            {icon}
          </Flex>
        )}
        <Text
          my="auto"
          fontSize="sm"
          fontWeight="semibold"
          color={active ? 'text.primary' : 'text.secondary'}
        >
          {name}
        </Text>
      </Button>
    </Link>
  );
};

export default Item;
