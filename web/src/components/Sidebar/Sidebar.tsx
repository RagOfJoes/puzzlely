import {
  Box,
  BoxProps,
  Heading,
  Link,
  StylesProvider,
  useMultiStyleConfig,
  VStack,
} from '@chakra-ui/react';

import Separator from '@/components/Separator';

import Item from './Item';

export type SidebarProps = BoxProps & {
  containerProps?: BoxProps;
  icon?: JSX.Element;
  name: string;
};

const Sidebar = (props: SidebarProps) => {
  const { children, containerProps, icon, name, ...rest } = props;

  const style = useMultiStyleConfig('Sidebar', {});

  return (
    <Box as="nav" __css={style.container} {...containerProps}>
      <StylesProvider value={style}>
        <Box __css={style.wrapper} {...rest}>
          <Link
            px="4"
            href="/"
            mb="25px"
            display="flex"
            textDecor="none"
            alignItems="center"
            _hover={{
              textDecor: 'none',
            }}
            _focus={{
              boxShadow: 'none',
            }}
          >
            {icon && icon}
            <Heading
              ms="12px"
              fontSize="lg"
              position="relative"
              _after={{
                left: 0,
                right: 3,
                zIndex: -1,
                bottom: 0.3,
                content: '""',
                height: '2px',
                position: 'absolute',
                backgroundColor: 'primary',
              }}
            >
              {name}
            </Heading>
          </Link>
          <Separator />
          {/* Height is calculated via container's paddingY + Icon height + Divider height */}
          <VStack mt="25px" h="calc(100% - 75px)">
            {children}
          </VStack>
        </Box>
      </StylesProvider>
    </Box>
  );
};

Sidebar.Item = Item;
export default Sidebar;
