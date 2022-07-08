import { VStack } from '@chakra-ui/react';

import UserSetupForm from '@/components/UserSetupForm';
import useUserUpdate from '@/hooks/useUserUpdate';
import AuthLayout from '@/layouts/Auth';

const UserSetupContainer = () => {
  const { mutate } = useUserUpdate();

  return (
    <AuthLayout
      lead="Let's complete your account setup"
      caption="To start enjoying all the features of Puzzlely"
    >
      <VStack mt="6" w="100%" align="flex-start">
        <UserSetupForm
          onSubmit={(values, { setErrors, setSubmitting }) => {
            setSubmitting(true);

            mutate(
              { updates: values },
              {
                onError: (error) => {
                  setErrors({ username: error.message });
                },
                onSettled: () => {
                  setSubmitting(false);
                },
              }
            );
          }}
        />
      </VStack>
    </AuthLayout>
  );
};

export default UserSetupContainer;
