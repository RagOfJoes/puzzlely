import { memo, useMemo } from 'react';

import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { IoPlay } from 'react-icons/io5';

import LikeButton from '@/components/LikeButton';
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from '@/lib/constants';
import { difficultyColor } from '@/lib/game';
import { millisecondsTo } from '@/lib/time';
import { Puzzle } from '@/types/puzzle';

export type PuzzleCardProps = Pick<
  Puzzle,
  | 'createdAt'
  | 'difficulty'
  | 'id'
  | 'likedAt'
  | 'maxAttempts'
  | 'name'
  | 'numOfLikes'
  | 'timeAllowed'
> & {
  createdBy: string;
  isEditable?: boolean;
  onLike?: () => void | Promise<void>;
};

const PuzzleCard = (props: PuzzleCardProps) => {
  const {
    createdAt,
    createdBy,
    difficulty,
    id,
    isEditable,
    likedAt,
    maxAttempts,
    name,
    numOfLikes,
    onLike = () => {},
    timeAllowed,
  } = props;

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
    <Box
      p="4"
      w="100%"
      h="100%"
      bg="surface"
      as="article"
      boxShadow="sm"
      borderRadius="lg"
    >
      <HStack w="100%" align="start" justify="space-between">
        <VStack w="100%" spacing="1" align="flex-start">
          <HStack>
            <Badge colorScheme={difficultyColor[difficulty]}>
              {difficulty}
            </Badge>
            <Link passHref href={`/users/${createdBy}`}>
              <Text as="a" fontSize="sm" fontWeight="semibold">
                {createdBy}
              </Text>
            </Link>
          </HStack>
          <Text
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="wide"
            color="text.secondary"
            textTransform="uppercase"
          >
            {maxAttemptsText} &bull; {timeAllowedText}
          </Text>
        </VStack>

        <LikeButton
          isLiked={!!likedAt}
          numOfLikes={numOfLikes}
          onLike={onLike}
        />
      </HStack>

      <Heading mt="2" size="sm" noOfLines={1} lineHeight="normal">
        {name}
      </Heading>

      <HStack mt="4" w="100%" align="center" justify="space-between">
        <Text
          w="100%"
          as="time"
          fontSize="xs"
          noOfLines={1}
          fontWeight="medium"
          letterSpacing="wide"
          color="text.secondary"
          dateTime={dayjs(createdAt).tz().toISOString()}
        >
          {dayjs(createdAt).tz().format('MMM DD, YYYY')}
        </Text>

        {isEditable && (
          <Link passHref href={`/puzzles/update/${id}`}>
            <Button
              as="a"
              size="sm"
              rel="nofollow"
              variant="link"
              flexShrink="0"
              colorScheme="gray"
            >
              Edit
            </Button>
          </Link>
        )}
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

export default memo(PuzzleCard);
