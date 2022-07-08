import { useMemo } from 'react';

import {
  Badge,
  Button,
  Divider,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import Link from 'next/link';

import GameChallengerResults from '@/components/GameChallengerResults';
import GameMenuCard from '@/components/GameMenuCard';
import { MainMenuProps } from '@/containers/Game';
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from '@/lib/constants';
import { difficultyColor } from '@/lib/game';
import { millisecondsTo } from '@/lib/time';

const MainMenu = (props: MainMenuProps) => {
  const { game, onConfig, onStart } = props;

  const { config, challengedBy, puzzle } = game;
  const { maxAttempts, timeAllowed } = config;
  const { createdAt, createdBy, difficulty, groups, name } = puzzle;

  const maxAttemptsText = useMemo(() => {
    if (maxAttempts === UNLIMITED_MAX_ATTEMPTS) {
      return 'Unlimited Attempts';
    }
    return `${maxAttempts} attempt${maxAttempts! > 1 ? 's' : ''}`;
  }, [maxAttempts]);
  const timeAllowedText = useMemo(() => {
    if (timeAllowed === UNLIMITED_TIME_ALLOWED) return 'No Time Limit';

    const minutes = millisecondsTo('minutes', timeAllowed!);
    const seconds = millisecondsTo('seconds', timeAllowed!);

    const formatMin = `${minutes} min${minutes > 1 ? 's' : ''}`;
    const formatSec = `${seconds} sec${seconds > 1 ? 's' : ''}`;
    return `${minutes > 0 ? `${formatMin} ` : ''} ${
      seconds > 0 ? formatSec : ''
    }`;
  }, [timeAllowed]);

  return (
    <GameMenuCard>
      <HStack w="100%" spacing="6" justify="space-between">
        <VStack w="100%" spacing="0" align="flex-start">
          <Link passHref href={`/users/${createdBy.username}`}>
            <Text as="a" fontSize="sm" fontWeight="semibold">
              {createdBy.username}
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

      <Heading mt="2" size="sm" noOfLines={1}>
        {name}
      </Heading>

      <HStack spacing="1" w="100%" align="center">
        <Text fontSize="xs" fontWeight="medium" color="text.secondary">
          Created at:
        </Text>
        <Text
          as="time"
          noOfLines={1}
          fontSize="xs"
          fontWeight="medium"
          letterSpacing="wide"
          color="text.secondary"
          dateTime={dayjs(createdAt).tz().toISOString()}
        >
          {dayjs(createdAt).tz().format('MM/DD/YYYY')}
        </Text>
      </HStack>

      {!!challengedBy && (
        <>
          <Divider my="2" />
          <GameChallengerResults
            user={challengedBy.user}
            score={challengedBy.score}
            maxScore={groups.length * 2}
            attempts={challengedBy.attempts}
            maxAttempts={config.maxAttempts}
          />
        </>
      )}

      <HStack mt="4" w="100%">
        <Button
          w="100%"
          variant="outline"
          colorScheme="gray"
          aria-label="Update game settings"
          onClick={onConfig}
        >
          Settings
        </Button>
        <Button w="100%" aria-label="Start game" onClick={onStart}>
          Start
        </Button>
      </HStack>
    </GameMenuCard>
  );
};

export default MainMenu;
