import { Button, HStack } from '@chakra-ui/react';
import NextLink from 'next/link';

const NotFoundContainer = () => {
  return (
    <HStack mt="2" w="100%" align="flex-start">
      <NextLink href="/">
        <Button
          size="lg"
          width="100%"
          bg="surface"
          boxShadow="sm"
          variant="solid"
          borderRadius="lg"
          colorScheme="gray"
          color="text.primary"
          _hover={{ bg: 'surface' }}
          _active={{ bg: 'surface' }}
        >
          Take me home
        </Button>
      </NextLink>
      <NextLink href="/puzzles">
        <Button
          size="lg"
          width="100%"
          bg="surface"
          boxShadow="sm"
          variant="solid"
          borderRadius="lg"
          colorScheme="gray"
          color="text.primary"
          _hover={{ bg: 'surface' }}
          _active={{ bg: 'surface' }}
        >
          See all Puzzles
        </Button>
      </NextLink>
    </HStack>
  );
};

export default NotFoundContainer;
