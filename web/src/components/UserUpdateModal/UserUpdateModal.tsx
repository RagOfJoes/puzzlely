import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { Form, Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';

import FormikInputControl from '@/components/FormikInputControl';
import { USERNAME_SCHEMA } from '@/lib/constants';
import { UserUpdatePayload } from '@/types/user';

export type UserUpdateModalProps = {
  initialValues: UserUpdatePayload;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (
    values: UserUpdatePayload,
    helpers: FormikHelpers<UserUpdatePayload>
  ) => void | Promise<void>;
};

const schema = yup.object().shape({
  username: USERNAME_SCHEMA,
});

const UserUpdateModal = (props: UserUpdateModalProps) => {
  const { initialValues, isOpen, onClose, onSubmit = () => {} } = props;

  return (
    <Modal size="lg" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <Formik
        validateOnChange
        validationSchema={schema}
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ dirty, isSubmitting, isValid }) => (
          <ModalContent>
            <ModalHeader>Edit User Profile</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box as={Form} style={{ width: '100%' }}>
                <FormikInputControl
                  isRequired
                  name="username"
                  label="Username"
                  helperText="Must be 4 - 24 characters long. Only letters and numbers are allowed."
                  inputProps={{
                    autoComplete: 'off',
                  }}
                />
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                isLoading={isSubmitting}
                isDisabled={!dirty || !isValid}
              >
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </Formik>
    </Modal>
  );
};

export default UserUpdateModal;
