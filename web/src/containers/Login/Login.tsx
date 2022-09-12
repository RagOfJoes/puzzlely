import {
  Button,
  Icon,
  Link,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { IoLogoDiscord, IoLogoGithub, IoLogoGoogle } from 'react-icons/io5';

const LoginContainer = () => {
  const buttonBgHover = useColorModeValue('gray.200', 'slate');
  const buttonBgActive = useColorModeValue('blackAlpha.200', 'whiteAlpha.300');

  return (
    <>
      <VStack mt="6" spacing="4" align="flex-start">
        {[
          {
            title: 'Discord',
            icon: IoLogoDiscord,
            path: '/api/auth/discord/',
          },
          { title: 'GitHub', icon: IoLogoGithub, path: '/api/auth/github' },
          { title: 'Google', icon: IoLogoGoogle, path: '/api/auth/google' },
        ].map((p) => {
          return (
            <NextLink href={p.path || ''} key={p.title}>
              <Button
                size="lg"
                width="100%"
                bg="surface"
                boxShadow="md"
                color="text.primary"
                leftIcon={<Icon as={p.icon} />}
                _hover={{ bg: buttonBgHover }}
                _active={{ bg: buttonBgActive }}
              >
                Log in with {p.title}
              </Button>
            </NextLink>
          );
        })}
      </VStack>

      <Text mt="4" fontSize="sm" color="text.secondary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" color="primary">
          <Text as="strong">Sign up</Text>
        </Link>
      </Text>
    </>
  );
};

export default LoginContainer;
