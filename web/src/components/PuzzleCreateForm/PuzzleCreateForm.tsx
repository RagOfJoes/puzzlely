import { Box } from '@chakra-ui/react';
import { Form, Formik } from 'formik';

import Groups from './Groups';
import Meta from './Meta';
import schema from './schema';
import Settings from './Settings';
import Submit from './Submit';
import { PuzzleCreateFormProps } from './types';

const PuzzleCreateForm = (props: PuzzleCreateFormProps) => {
  const { initialValues, onSubmit = () => {} } = props;

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
        <Settings />
        <Groups />
        <Submit />
      </Box>
    </Formik>
  );
};

export default PuzzleCreateForm;
