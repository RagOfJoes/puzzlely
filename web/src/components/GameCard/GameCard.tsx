import { useMemo } from 'react';

import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Icon,
  Text,
  useClipboard,
  VStack,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { IoCheckbox, IoPlay, IoReader, IoRocket } from 'react-icons/io5';

import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from '@/lib/constants';
import { difficultyColor } from '@/lib/game';
import { millisecondsTo } from '@/lib/time';
import { Game } from '@/types/game';
import { Puzzle } from '@/types/puzzle';

export type GameCardProps = {
  attempts: number;
  completedAt: Date;
  createdBy: string;
  difficulty: Puzzle['difficulty'];
  challengeCode: Game['challengeCode'];
  id: string;
  isPlayable?: boolean;
  maxAttempts: number;
  maxScore: number;
  name: string;
  score: number;
  startedAt: Date;
  timeAllowed: number;
};

const GameCard = (props: GameCardProps) => {
  const {
    attempts,
    completedAt,
    createdBy,
    difficulty,
    challengeCode,
    id,
    isPlayable,
    maxAttempts,
    maxScore,
    name,
    score,
    startedAt,
    timeAllowed,
  } = props;

  const { hasCopied, onCopy } = useClipboard(
    `${process.env.NEXT_PUBLIC_HOST_URL}/games/challenge/${challengeCode}`,
    3000
  );

  const maxAttemptsText = useMemo(() => {
    if (maxAttempts === UNLIMITED_MAX_ATTEMPTS) {
      return 'Unlimited Attempts';
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
  const timeElapsed = useMemo(() => {
    const diff = dayjs.duration(
      dayjs(completedAt).tz().diff(dayjs(startedAt).tz())
    );
    return diff;
  }, [completedAt, startedAt]);

  return (
    <Box p="4" bg="surface" as="article" boxShadow="sm" borderRadius="lg">
      <HStack w="100%" justify="space-between">
        <VStack w="100%" spacing="0" align="flex-start">
          <Link passHref href={`/users/${createdBy}`}>
            <Text as="a" fontSize="sm" fontWeight="semibold">
              {createdBy}
            </Text>
          </Link>
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

        <Badge colorScheme={difficultyColor[difficulty]}>{difficulty}</Badge>
      </HStack>

      <Heading mt="2" size="sm" noOfLines={1} lineHeight="normal">
        {name}
      </Heading>

      <VStack mt="2" w="100%" align="start" spacing="1">
        <HStack w="100%" justify="space-between">
          <Text fontSize="xs" fontWeight="medium" color="text.secondary">
            Score
          </Text>
          <Text fontSize="xs" fontWeight="medium">
            {score}
            <Text
              as="small"
              fontSize="xs"
              fontWeight="medium"
              color="text.secondary"
            >
              {' / '}
              {maxScore}
            </Text>
          </Text>
        </HStack>
        <HStack w="100%" justify="space-between">
          <Text fontSize="xs" color="text.secondary" fontWeight="medium">
            Attempts
          </Text>
          <Text fontSize="xs" fontWeight="medium">
            {attempts}
            <Text
              as="small"
              fontSize="xs"
              fontWeight="medium"
              color="text.secondary"
            >
              {' / '}
              {maxAttempts}
            </Text>
          </Text>
        </HStack>
        <HStack w="100%" justify="space-between">
          <Text fontSize="xs" color="text.secondary" fontWeight="medium">
            Total Time
          </Text>
          <Text
            as="time"
            fontSize="xs"
            fontWeight="medium"
            dateTime={timeElapsed.toISOString()}
          >
            {timeElapsed.format('HH:mm:ss')}
          </Text>
        </HStack>
      </VStack>

      <HStack mt="4" w="100%" justify="end">
        {isPlayable ? (
          <>
            <Link passHref href={`/games/challenge/${challengeCode}`}>
              <Button
                as="a"
                w="100%"
                size="sm"
                rel="nofollow"
                variant="outline"
                colorScheme="gray"
                leftIcon={<Icon as={IoRocket} />}
              >
                Challenge
              </Button>
            </Link>
            <Link passHref href={`/games/play/${id}`}>
              <Button
                as="a"
                w="100%"
                size="sm"
                rel="nofollow"
                rightIcon={<Icon as={IoPlay} />}
              >
                Play
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Button
              w="100%"
              size="sm"
              variant="outline"
              colorScheme="gray"
              leftIcon={<Icon as={hasCopied ? IoCheckbox : IoRocket} />}
              onClick={() => onCopy()}
            >
              {hasCopied ? 'Copied!' : 'Challenge'}
            </Button>
            <Link passHref href={`/games/${id}`}>
              <Button
                as="a"
                w="100%"
                size="sm"
                rel="nofollow"
                rightIcon={<Icon as={IoReader} />}
              >
                View
              </Button>
            </Link>
          </>
        )}
      </HStack>
    </Box>
  );
};

export default GameCard;
