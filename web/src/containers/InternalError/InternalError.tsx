import { Button, HStack, Icon } from '@chakra-ui/react';
import Link from 'next/link';

import InternalErrorIcon from '@/components/InternalErrorIcon';
import ErrorLayout from '@/layouts/Error';

const InternalErrorContainer = () => {
  return (
    <ErrorLayout
      lead="Internal Error..."
      caption="Oops! Sorry, unexpected error. Please try again later."
      icon={
        <Icon
          h="auto"
          w="100%"
          maxH="250px"
          as={InternalErrorIcon}
          aria-label="Internal Error"
        />
      }
    >
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
    </ErrorLayout>
  );
};

export default InternalErrorContainer;
