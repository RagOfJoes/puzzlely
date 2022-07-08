import { Box, VStack } from '@chakra-ui/react';

import PuzzleUpdateForm from '@/components/PuzzleUpdateForm';
import usePuzzleDelete from '@/hooks/usePuzzleDelete';
import usePuzzleUpdate from '@/hooks/usePuzzleUpdate';
import Main from '@/layouts/Main';
import { Puzzle } from '@/types/puzzle';

export type PuzzleUpdateContainerProps = {
  puzzle: Puzzle;
};

const PuzzleUpdateContainer = (props: PuzzleUpdateContainerProps) => {
  const { puzzle } = props;

  const { isLoading: isDeleting, mutate: deletePuzzle } = usePuzzleDelete();
  const { mutate: updatePuzzle } = usePuzzleUpdate(puzzle.id);

  return (
    <Main breadcrumbLinks={[{ path: '/puzzles', title: 'Puzzles' }]}>
      <Box w="100%" display="flex" justifyContent="center">
        <VStack w="100%" spacing="3" maxW="container.md">
          <PuzzleUpdateForm
            puzzle={puzzle}
            isDeleting={isDeleting}
            onDelete={() => deletePuzzle(puzzle.id)}
            onSubmit={async (
              values,
              { setErrors, setSubmitting, validateForm }
            ) => {
              setSubmitting(true);

              const errors = await validateForm(values);
              if (Object.keys(errors).length > 0) {
                setErrors(errors);
                setSubmitting(false);
                return;
              }

              updatePuzzle(values, {
                onSettled: () => {
                  setSubmitting(false);
                },
              });
            }}
          />
        </VStack>
      </Box>
    </Main>
  );
};

export default PuzzleUpdateContainer;
