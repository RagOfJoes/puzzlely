import { Box, VStack } from '@chakra-ui/react';

import PuzzleCreateForm from '@/components/PuzzleCreateForm';
import usePuzzleCreate from '@/hooks/usePuzzleCreate';
import Main from '@/layouts/Main';

import { initialValues } from './utils';

const PuzzleCreateContainer = () => {
  const { mutate } = usePuzzleCreate();

  return (
    <Main
      breadcrumbLinks={[
        { path: '/puzzles', title: 'Puzzles' },
        { path: '/puzzles/create', title: 'Create' },
      ]}
    >
      <Box w="100%" display="flex" justifyContent="center">
        <VStack w="100%" spacing="3" maxW="container.md">
          <PuzzleCreateForm
            initialValues={initialValues}
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

              mutate(values, {
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

export default PuzzleCreateContainer;
