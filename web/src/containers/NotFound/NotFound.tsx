import { Button, HStack, Icon } from '@chakra-ui/react';
import NextLink from 'next/link';

import NotFoundIcon from '@/components/NotFoundIcon';
import ErrorLayout from '@/layouts/Error';

const NotFoundContainer = () => {
  return (
    <ErrorLayout
      lead="Page Not Found..."
      caption="Hmmm... Seems you're a bit lost. Let's get you back on track."
      icon={
        <Icon
          h="auto"
          w="100%"
          maxH="250px"
          as={NotFoundIcon}
          aria-label="Not Found"
        />
      }
    >
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
    </ErrorLayout>
  );
};

export default NotFoundContainer;
