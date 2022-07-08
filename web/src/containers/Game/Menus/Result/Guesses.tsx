import { useMemo } from 'react';

import { Heading, VStack } from '@chakra-ui/react';

import GameGuessCard from '@/components/GameGuessCard';
import groupBy from '@/lib/groupBy';
import { Result } from '@/types/game';
import { Group } from '@/types/puzzle';

import { ResultMenuProps } from '../../types';

const Guesses = (
  props: Pick<ResultMenuProps, 'blocks'> &
    Pick<ResultMenuProps['game'], 'puzzle' | 'results'>
) => {
  const { blocks, puzzle, results } = props;
  const { groups } = puzzle;

  const grouped = useMemo(
    () => groupBy(blocks, (block) => block.groupID),
    [blocks]
  );
  const groupsMap = useMemo(() => {
    const map: { [groupID: string]: Group } = {};
    groups.forEach((group) => {
      if (!map[group.id]) {
        map[group.id] = group;
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const resultsMap = useMemo(() => {
    const map: Record<string, Result> = {};
    results.forEach((result) => {
      if (!map[result.groupID]) {
        map[result.groupID] = result;
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const valuesMap = useMemo(() => {
    const map: { [groupID: string]: string[] } = {};
    groups.forEach((group) => {
      if (!map[group.id]) {
        map[group.id] = group.blocks.map((b) => b.value);
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <VStack w="100%" align="flex-start">
      <Heading size="xs" noOfLines={1}>
        Guesses
      </Heading>
      {grouped.map((block) => {
        const group = groupsMap[block[0]?.groupID ?? ''];

        const values = valuesMap[group?.id ?? ''];
        const result = resultsMap[group?.id ?? ''];

        if (!group || !result || !values) {
          return null;
        }

        return (
          <GameGuessCard
            key={group.id}
            values={values}
            guess={result.guess}
            isCorrect={result.correct}
            description={group.description}
          />
        );
      })}
    </VStack>
  );
};

export default Guesses;
