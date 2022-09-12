import { Button, HStack } from '@chakra-ui/react';
import Link from 'next/link';

const InternalErrorContainer = () => {
  return (
    <HStack mt="2" w="100%" align="flex-start">
      <Link passHref href="/">
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
      </Link>
      <Link passHref href="/puzzles">
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
      </Link>
    </HStack>
  );
};

export default InternalErrorContainer;
