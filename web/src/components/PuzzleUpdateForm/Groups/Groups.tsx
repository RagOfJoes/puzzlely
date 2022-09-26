import { VStack } from '@chakra-ui/react';

import PuzzleFormCard from '@/components/PuzzleFormCard';

import { PuzzleUpdateFormProps } from '../types';
import Group from './Group';

const Groups = (props: Pick<PuzzleUpdateFormProps, 'puzzle'>) => {
  const { puzzle } = props;

  return (
    <PuzzleFormCard
      mt="6"
      title="Groups"
      caption="The building blocks of your puzzle."
    >
      <VStack mt="4" w="100%" align="start" spacing="6">
        {puzzle.groups.map((group, index) => {
          return (
            <Group
              index={index}
              group={group}
              key={`PuzzleUpdateForm__Group__${index}`}
            />
          );
        })}
      </VStack>
    </PuzzleFormCard>
  );
};

export default Groups;
