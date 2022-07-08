import { useMemo } from 'react';

import { Box, Divider, Heading, HStack, Text } from '@chakra-ui/react';

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
    <Box p="4" mt="6" bg="surface" borderRadius="lg">
      <Heading as="h4" size="md">
        Settings
      </Heading>
      <Text fontSize="md" color="text.secondary">
        Fields that restricts what player&apos;s can configure about their game.
      </Text>

      <Divider my="2" />

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
    </Box>
  );
};

export default Settings;
