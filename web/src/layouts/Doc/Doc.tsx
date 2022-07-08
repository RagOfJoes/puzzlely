import { PropsWithChildren } from 'react';

import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { NextSeo } from 'next-seo';
import { MdCopyright } from 'react-icons/md';

import PuzzlelyIcon from '@/components/PuzzlelyIcon';

export type DocLayoutProps = {
  title: string;
};

const DocLayout = (props: PropsWithChildren<DocLayoutProps>) => {
  const { title } = props;

  const { colorMode } = useColorMode();

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

      <Container
        py="6"
        h="100%"
        minH="100vh"
        display="flex"
        flexDir="column"
        maxW="container.lg"
        alignItems="flex-start"
      >
        <Link
          href="/"
          display="flex"
          textDecor="none"
          alignItems="center"
          justifyContent="center"
          _hover={{
            textDecor: 'none',
          }}
          _focusVisible={{
            boxShadow: 'none',
          }}
        >
          <Icon w="9" h="9" boxShadow="sm" as={PuzzlelyIcon} />
          <Heading ms="12px" size="sm">
            Puzzlely
          </Heading>
        </Link>

        <Box py="12" w="100%">
          <Flex justify="center">
            <Heading size="lg">{title}</Heading>
          </Flex>

          {props.children}
        </Box>

        <HStack mt="auto" align="center" spacing="1" justify="flex-start">
          <Icon w="12px" h="12px" as={MdCopyright} color="text.secondary" />
          <Text fontSize="xs" color="text.secondary" lineHeight="short">
            Puzzlely {dayjs().tz().year()}
          </Text>
        </HStack>
      </Container>
    </>
  );
};

export default DocLayout;
