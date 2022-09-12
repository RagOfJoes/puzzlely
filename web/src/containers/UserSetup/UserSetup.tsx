import { VStack } from '@chakra-ui/react';

import UserSetupForm from '@/components/UserSetupForm';
import useUserUpdate from '@/hooks/useUserUpdate';

const UserSetupContainer = () => {
  const { mutate } = useUserUpdate();

  return (
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
  );
};

export default UserSetupContainer;
