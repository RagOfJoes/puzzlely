import { useMemo } from 'react';

import { Heading, HStack, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';

import { ResultMenuProps } from '../../types';

const Overview = (
  props: Pick<
    ResultMenuProps['game'],
    'completedAt' | 'puzzle' | 'score' | 'startedAt'
  >
) => {
  const { completedAt, puzzle, score, startedAt } = props;
  const { groups } = puzzle;

  const timeElapsed = useMemo(() => {
    const diff = dayjs.duration(
      dayjs(completedAt).tz().diff(dayjs(startedAt).tz())
    );
    return diff.format('HH:mm:ss');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <VStack w="100%" align="flex-start">
      <Heading size="xs" noOfLines={1}>
        Overview
      </Heading>
      <HStack w="100%" justify="space-between">
        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
          Score
        </Text>
        <Text fontSize="sm" fontWeight="medium">
          {score}
          <Text
            as="small"
            fontSize="sm"
            fontWeight="medium"
            color="text.secondary"
          >
            {' / '}
            {groups.length * 2}
          </Text>
        </Text>
      </HStack>
      <HStack w="100%" justify="space-between">
        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
          Total Time
        </Text>
        <Text fontSize="sm" fontWeight="medium">
          {timeElapsed}
        </Text>
      </HStack>
    </VStack>
  );
};

export default Overview;
