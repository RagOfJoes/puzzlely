import { Box, Button, Text } from '@chakra-ui/react';
import { useFormikContext } from 'formik';

import { PuzzleCreatePayload } from '@/types/puzzle';

const Submit = () => {
  const { dirty, isSubmitting, isValid } =
    useFormikContext<PuzzleCreatePayload>();

  return (
    <Box p="4" mt="6" w="100%" bg="surface" borderRadius="lg">
      <Text fontSize="sm" color="text.secondary">
        Make sure all the inputs contain their intended values. Once the Puzzle
        has been created the only fields that&apos;ll be editable are the
        Puzzle&apos;s Name, Puzzle&apos;s Description, Puzzle&apos;s Difficulty,
        and, Group Description.
      </Text>

      <Button
        mt="4"
        w="100%"
        type="submit"
        isLoading={isSubmitting}
        isDisabled={!dirty || !isValid}
      >
        Create Puzzle
      </Button>
    </Box>
  );
};

export default Submit;
