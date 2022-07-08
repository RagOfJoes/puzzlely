import { useMemo } from 'react';

import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';
import { IoPlay } from 'react-icons/io5';

import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from '@/lib/constants';
import { difficultyColor } from '@/lib/game';
import { millisecondsTo } from '@/lib/time';
import { Puzzle } from '@/types/puzzle';

export type PuzzleItemProps = Pick<
  Puzzle,
  'difficulty' | 'id' | 'maxAttempts' | 'name' | 'timeAllowed'
> & {
  createdBy: string;
};

const PuzzleItem = (props: PuzzleItemProps) => {
  const { createdBy, difficulty, id, maxAttempts, name, timeAllowed } = props;

  const maxAttemptsText = useMemo(() => {
    if (maxAttempts === UNLIMITED_MAX_ATTEMPTS) {
      return <>&infin; attempts</>;
    }
    return `${maxAttempts} attempt${maxAttempts! > 1 ? 's' : ''}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxAttempts]);
  const timeAllowedText = useMemo(() => {
    if (timeAllowed === UNLIMITED_TIME_ALLOWED) {
      return 'No Time Limit';
    }

    const minutes = millisecondsTo('minutes', timeAllowed!);
    const seconds = millisecondsTo('seconds', timeAllowed!);

    const formatMin = `${minutes} min${minutes > 1 ? 's' : ''}`;
    const formatSec = `${seconds} sec${seconds > 1 ? 's' : ''}`;
    return `${minutes > 0 ? `${formatMin} ` : ''} ${
      seconds > 0 ? formatSec : ''
    }`;
  }, [timeAllowed]);

  return (
    <Box w="100%" h="100%" as="article">
      <HStack w="100%" spacing="0" align="center" justify="space-between">
        <Box
          w="100%"
          display="flex"
          overflow="hidden"
          flexDirection="column"
          alignItems="flex-start"
        >
          <HStack w="100%" align="center" overflow="hidden">
            <Badge px="1" colorScheme={difficultyColor[difficulty]}>
              {difficulty}
            </Badge>
            <Link passHref href={`/users/${createdBy}`}>
              <Text
                as="a"
                noOfLines={1}
                fontSize="sm"
                title={createdBy}
                fontWeight="medium"
                display="inline-block"
              >
                {createdBy}
              </Text>
            </Link>
          </HStack>

          <Text
            mt="1"
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="wide"
            color="text.secondary"
            textTransform="uppercase"
          >
            {maxAttemptsText} &bull; {timeAllowedText}
          </Text>

          <Heading mt="1" w="100%" size="sm" noOfLines={1} lineHeight="normal">
            {name}
          </Heading>
        </Box>

        <Link passHref href={`/games/play/${id}`}>
          <Button
            as="a"
            size="sm"
            rel="nofollow"
            flexShrink="0"
            rightIcon={<Icon as={IoPlay} />}
          >
            Play
          </Button>
        </Link>
      </HStack>
    </Box>
  );
};

export default PuzzleItem;
