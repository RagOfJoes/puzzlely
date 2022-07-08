import { useMemo } from 'react';

import { Box } from '@chakra-ui/react';
import { Form, Formik } from 'formik';

import { PuzzleUpdatePayload } from '@/types/puzzle';

import Groups from './Groups';
import Meta from './Meta';
import schema from './schema';
import Settings from './Settings';
import Submit from './Submit';
import { PuzzleUpdateFormProps } from './types';

const PuzzleUpdateForm = (props: PuzzleUpdateFormProps) => {
  const {
    isDeleting,
    onDelete = () => {},
    onSubmit = () => {},
    puzzle,
  } = props;

  const initialValues: PuzzleUpdatePayload = useMemo(
    () => ({
      name: puzzle.name,
      description: puzzle.description,
      difficulty: puzzle.difficulty,
      groups: puzzle.groups.map((group) => ({
        id: group.id,
        description: group.description,
      })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Formik
      validateOnBlur
      validateOnChange={false}
      validationSchema={schema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      <Box as={Form} w="100%">
        <Meta />
        <Settings puzzle={puzzle} />
        <Groups puzzle={puzzle} />
        <Submit isDeleting={isDeleting} onDelete={onDelete} />
      </Box>
    </Formik>
  );
};

export default PuzzleUpdateForm;
