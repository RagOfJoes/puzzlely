import { Box, Divider, Heading, Text, VStack } from '@chakra-ui/react';
import { useFormikContext } from 'formik';

import { PuzzleCreatePayload } from '@/types/puzzle';

import Group from './Group';

const Groups = () => {
  const { values } = useFormikContext<PuzzleCreatePayload>();

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
        {values.groups.map((_, index) => {
          return (
            <Group index={index} key={`PuzzleCreateForm__Group__${index}`} />
          );
        })}
      </VStack>
    </Box>
  );
};

export default Groups;
