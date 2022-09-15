import { useMemo } from 'react';

import { Box, HStack, Text } from '@chakra-ui/react';

import PuzzleFormCard from '@/components/PuzzleFormCard';
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from '@/lib/constants';
import { formatTime, millisecondsTo } from '@/lib/time';

import { PuzzleUpdateFormProps } from './types';

const Settings = (props: Pick<PuzzleUpdateFormProps, 'puzzle'>) => {
  const { puzzle } = props;

  const { minutes, seconds } = useMemo(
    () => ({
      minutes: millisecondsTo('minutes', puzzle.timeAllowed),
      seconds: millisecondsTo('seconds', puzzle.timeAllowed),
    }),
    [puzzle.timeAllowed]
  );

  return (
    <PuzzleFormCard
      mt="6"
      title="Settings"
      caption="Fields that restricts what player's can configure about their game."
    >
      <HStack mt="4" w="100%" spacing="4" justify="space-between">
        <Box w="100%">
          <Text fontSize="md" fontWeight="medium">
            Max Attempts
          </Text>
          <Text fontSize="md" fontWeight="medium">
            {puzzle.maxAttempts === UNLIMITED_MAX_ATTEMPTS
              ? 'Unlimited'
              : puzzle.maxAttempts}
          </Text>
        </Box>
        <Box w="100%">
          <Text fontSize="md" fontWeight="medium">
            Time Limit
          </Text>
          <Text fontSize="md" fontWeight="medium">
            {puzzle.timeAllowed === UNLIMITED_TIME_ALLOWED
              ? 'Unlimited'
              : `${formatTime(minutes)}:${formatTime(seconds)}`}
          </Text>
        </Box>
      </HStack>
    </PuzzleFormCard>
  );
};

export default Settings;
