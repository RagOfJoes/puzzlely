import { VStack } from '@chakra-ui/react';
import { useFormikContext } from 'formik';

import PuzzleFormCard from '@/components/PuzzleFormCard';
import { PuzzleCreatePayload } from '@/types/puzzle';

import { PuzzleCreateFormGroupProps } from '../types';
import Group from './Group';

const Groups = () => {
  const {
    errors,
    isSubmitting,
    setFieldTouched,
    setFieldValue,
    touched,
    values,
  } = useFormikContext<PuzzleCreatePayload>();

  return (
    <PuzzleFormCard
      mt="6"
      title="Groups"
      caption="The building blocks of your puzzle."
    >
      <VStack mt="4" w="100%" align="start" spacing="6">
        {values.groups.map((_, index) => {
          return (
            <Group
              index={index}
              isDisabled={isSubmitting}
              group={values.groups[index]!}
              setFieldValue={setFieldValue}
              setFieldTouched={setFieldTouched}
              key={`PuzzleCreateForm__Group__${index}`}
              errors={
                errors.groups?.[index] as PuzzleCreateFormGroupProps['errors']
              }
              touched={
                touched.groups?.[index] as PuzzleCreateFormGroupProps['touched']
              }
            />
          );
        })}
      </VStack>
    </PuzzleFormCard>
  );
};

export default Groups;
