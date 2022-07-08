import { Box, Divider, Heading, Text, VStack } from '@chakra-ui/react';

import { PuzzleUpdateFormProps } from '../types';
import Group from './Group';

const Groups = (props: Pick<PuzzleUpdateFormProps, 'puzzle'>) => {
  const { puzzle } = props;

  return (
    <Box p="4" mt="6" bg="surface" borderRadius="lg">
      <Heading as="h4" size="md">
        Groups
      </Heading>
      <Text fontSize="md" color="text.secondary">
        The building blocks of your puzzle.
      </Text>

      <Divider my="2" />

      <VStack mt="4" w="100%" align="start" spacing="6">
        {puzzle.groups.map((group, index) => {
          return (
            <Group
              index={index}
              group={group}
              key={`PuzzleUpdateForm__Group__${index}`}
            />
          );
        })}
      </VStack>
    </Box>
  );
};

export default Groups;
