import { Button, HStack } from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';

import FormikInputControl from '@/components/FormikInputControl';
import { USERNAME_SCHEMA } from '@/lib/constants';
import { UserUpdatePayload } from '@/types/user';

export type UserSetupFormProps = {
  initialValues?: UserUpdatePayload;
  onSubmit?: (
    values: UserUpdatePayload,
    helpers: FormikHelpers<UserUpdatePayload>
  ) => void | Promise<void>;
};

const schema = yup.object().shape({
  username: USERNAME_SCHEMA,
});

const UserSetupForm = (props: UserSetupFormProps) => {
  const { initialValues = { username: '' }, onSubmit = () => {} } = props;

  return (
    <Formik
      validateOnChange
      validationSchema={schema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {({ dirty, isSubmitting, isValid }) => (
        <Form style={{ width: '100%' }}>
          <FormikInputControl
            isRequired
            name="username"
            label="Username"
            helperText="Must be 4 - 24 characters long. Only letters and numbers are allowed."
            inputProps={{
              autoComplete: 'off',
            }}
          />
          <HStack mt="4" justify="end">
            <Button
              ml="auto"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={!dirty || isSubmitting || !isValid}
            >
              Submit
            </Button>
          </HStack>
        </Form>
      )}
    </Formik>
  );
};

export default UserSetupForm;
