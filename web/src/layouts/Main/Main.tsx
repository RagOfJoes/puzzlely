import { ReactNode, useMemo, useState } from 'react';

import {
  Box,
  BoxProps,
  Button,
  Flex,
  forwardRef,
  Icon,
  Text,
  useColorMode,
  useTheme,
  VStack,
} from '@chakra-ui/react';
import { SkipNavContent, SkipNavLink } from '@chakra-ui/skip-nav';
import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IoAdd, IoCreate, IoLogIn, IoLogOut, IoPerson } from 'react-icons/io5';

import PuzzlelyIcon from '@/components/PuzzlelyIcon';
import { Sidebar, SidebarItem, styles } from '@/components/Sidebar';
import Topbar, { TopbarProps } from '@/components/Topbar';
import useMe from '@/hooks/useMe';
import useSidebarLinks from '@/hooks/useSidebarLinks';
import { PROFILE_ROUTE } from '@/lib/constants';

export type MainLayoutProps = {
  breadcrumbLinks: TopbarProps['links'];
  children?: ReactNode;
  overrideLink?: string;
};

// eslint-disable-next-line react/display-name
const MainLayout = forwardRef<BoxProps & MainLayoutProps, 'div'>(
  (props, ref) => {
    const { breadcrumbLinks = [], children, overrideLink, ...rest } = props;

    const theme = useTheme();
    const router = useRouter();
    const { data: me } = useMe();
    const { colorMode = 'light' } = useColorMode();

    const [isOpen, toggleIsOpen] = useState(false);

    const links = useSidebarLinks(router, me, overrideLink);
    const isProfile = useMemo(() => {
      return me && router.pathname.split('/')?.[1] === PROFILE_ROUTE;
    }, [me, router.pathname]);

    return (
      <>
        <NextSeo
          additionalLinkTags={[
            {
              rel: 'manifest',
              href: `/${colorMode}/site.webmanifest`,
            },
            {
              rel: 'icon',
              href: `/${colorMode}/favicon.ico`,
            },
            {
              rel: 'icon',
              sizes: '16x16',
              type: 'image/png',
              href: `/${colorMode}/favicon-16x16.png`,
            },
            {
              rel: 'icon',
              sizes: '32x32',
              type: 'image/png',
              href: `/${colorMode}/favicon-32x32.png`,
            },
            {
              rel: 'icon',
              type: 'image/png',
              sizes: '16x16',
              href: `/${colorMode}/favicon-16x16.png`,
            },
            {
              sizes: '180x180',
              rel: 'apple-touch-icon',
              href: `/${colorMode}/apple-touch-icon.png`,
            },
          ]}
          additionalMetaTags={[
            {
              name: 'theme-color',
              content: colorMode === 'dark' ? '#282c34' : '#f4f4f7',
            },
          ]}
        />

        <Box
          px="0"
          maxW="1500px"
          marginX="auto"
          overflow="hidden"
          position="relative"
        >
          <SkipNavLink zIndex="1" bg="surface">
            Skip to content
          </SkipNavLink>

          <Sidebar
            name="Puzzlely"
            icon={<Icon w="9" h="9" boxShadow="sm" as={PuzzlelyIcon} />}
            containerProps={{
              transition: '0.12s linear opacity',
              opacity: {
                base: isOpen ? 1 : 0,
                lg: 1,
              },
            }}
          >
            <Link passHref href="/puzzles/create">
              <Button
                as="a"
                mt="2"
                mb="4"
                h="48px"
                py="12px"
                width="100%"
                flex="0 0 auto"
                cursor="pointer"
                borderRadius="full"
                alignItems="center"
                colorScheme="purple"
                aria-label="Create puzzle"
                justifyContent="flex-start"
                // purple.400
                boxShadow="0 0 12px 1px rgba(152, 131, 213, 0.6)"
                mx={{ xl: 'auto' }}
                ps={{ base: '10px', xl: '16px' }}
              >
                <Flex
                  w="30px"
                  h="30px"
                  me="12px"
                  align="center"
                  justify="center"
                  borderRadius="8px"
                  css={{
                    path: {
                      strokeWidth: 64,
                    },
                  }}
                >
                  <Icon as={IoAdd} />
                </Flex>
                <Text my="auto" fontSize="sm" fontWeight="semibold">
                  Create a Puzzle
                </Text>
              </Button>
            </Link>

            {links.map((link) => {
              const { path, icon, title, isActive, isSection } = link;

              if (isSection) {
                return <SidebarItem isSection key={path} name={title} />;
              }

              return (
                <SidebarItem
                  passHref
                  key={path}
                  href={path}
                  name={title}
                  isActive={isActive}
                  icon={<Icon as={icon} />}
                />
              );
            })}

            <VStack w="100%" h="100%" align="start" justify="end">
              <SidebarItem isSection name="Account" />
              {me ? (
                <>
                  <SidebarItem
                    passHref
                    name="Profile"
                    href="/profile/"
                    isActive={!!isProfile}
                    icon={<Icon as={IoPerson} />}
                  />
                  <SidebarItem
                    name="Sign out"
                    href="/api/logout"
                    icon={<Icon as={IoLogOut} />}
                  />
                </>
              ) : (
                <>
                  <SidebarItem
                    passHref
                    href="/signup/"
                    name="Sign up"
                    icon={<Icon as={IoCreate} />}
                  />
                  <SidebarItem
                    passHref
                    href="/login/"
                    name="Sign in"
                    icon={<Icon as={IoLogIn} />}
                  />
                </>
              )}
            </VStack>
          </Sidebar>

          <Box
            zIndex="1"
            minH="100vh"
            flex="1 1 0%"
            display="flex"
            position="relative"
            overflow="hidden auto"
            justifyContent="center"
            transition="0.12s linear all"
            ms={{ base: '0px', lg: styles.container.w as string }}
            left={{
              base: isOpen ? (styles.container.w as string) : '0px',
              lg: '0px',
            }}
          >
            <SkipNavContent />
            <Box
              w="100%"
              pt="20px"
              pb="40px"
              ref={ref}
              bg="background"
              maxW="container.xl"
              {...rest}
            >
              <Topbar
                open={isOpen}
                links={breadcrumbLinks}
                toggleOpen={toggleIsOpen}
                onSearch={async (
                  values,
                  { setErrors, setSubmitting, validateForm }
                ) => {
                  if (values.search.length === 0) {
                    return;
                  }

                  setSubmitting(true);

                  const errors = await validateForm(values);
                  if (Object.keys(errors).length > 0) {
                    setErrors(errors);
                    setSubmitting(false);
                    return;
                  }

                  setSubmitting(false);
                  await router.push({
                    pathname: '/search',
                    query: { term: values.search },
                  });
                }}
              />
              <Box as="main" pt={`calc(34px + ${theme.space[2]})`} px="20px">
                {children}
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    );
  }
);

export default MainLayout;
