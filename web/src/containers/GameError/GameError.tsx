import { Box, Button, Heading, HStack, Icon, Text } from '@chakra-ui/react';

import APIError from '@/api/error';
import GameErrorIcon from '@/components/GameErrorIcon';

export type GameErrorContainerProps = {
  error: APIError;
};

const GameErrorContainer = (props: GameErrorContainerProps) => {
  const { error } = props;

  return (
    <Box
      w="100%"
      h="100%"
      display="flex"
      alignItems="center"
      justifyContent={{ base: 'flex-start', md: 'space-evenly' }}
    >
      <Box
        display="flex"
        maxW="container.md"
        flexDirection="column"
        alignItems="flex-start"
        justifyContent="center"
        w={{ base: '100%', md: 'auto' }}
      >
        <Heading size="md">{error.code}...</Heading>
        <Text mt="4" fontSize="md" fontWeight="medium">
          {error.message}
        </Text>
        <HStack mt="8" w="100%">
          <Button
            variant="outline"
            colorScheme="gray"
            w={{ base: '100%', md: 'auto' }}
          >
            Puzzles
          </Button>
          <Button w={{ base: '100%', md: 'auto' }}>Take me home</Button>
        </HStack>
      </Box>

      <Icon
        h="auto"
        maxH="300px"
        as={GameErrorIcon}
        aria-label="Error"
        w={{ base: '0', md: '40%' }}
        display={{ base: 'none', md: 'block' }}
      />
    </Box>
  );
};

export default GameErrorContainer;
