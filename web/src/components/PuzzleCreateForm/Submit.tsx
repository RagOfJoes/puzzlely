import { Button, Text } from '@chakra-ui/react';
import { useFormikContext } from 'formik';

import PuzzleFormCard from '@/components/PuzzleFormCard';
import { PuzzleCreatePayload } from '@/types/puzzle';

const Submit = () => {
  const { dirty, isSubmitting, isValid } =
    useFormikContext<PuzzleCreatePayload>();

  return (
    <PuzzleFormCard mt="6" hideDivider>
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
    </PuzzleFormCard>
  );
};

export default Submit;
