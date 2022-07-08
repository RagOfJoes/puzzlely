import { useMemo } from 'react';

import { Button, Heading, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { IoSkull } from 'react-icons/io5';

import GameMenuCard from '@/components/GameMenuCard';
import { GameOverMenuProps } from '@/containers/Game';
import { millisecondsTo } from '@/lib/time';

const GameOver = (props: GameOverMenuProps) => {
  const { game, onContinue, onMenu } = props;
  const { attempts, guessedAt, score, startedAt } = game;

  const timeElapsed = useMemo(() => {
    const diff = dayjs(guessedAt).tz().diff(dayjs(startedAt).tz());
    const minutes = millisecondsTo('minutes', diff);
    const seconds = millisecondsTo('seconds', diff);

    const formatMin = `${minutes > 9 ? '' : 0}${minutes}`;
    const formatSec = `${seconds > 9 ? '' : 0}${seconds}`;
    return `${formatMin}:${formatSec}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameMenuCard>
      <HStack w="100%" spacing="6" justify="space-between">
        <VStack w="100%" spacing="0" align="flex-start">
          <Text fontSize="sm" fontWeight="semibold">
            Score: {score}
          </Text>
          <Text
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="wide"
            color="text.secondary"
            textTransform="uppercase"
          >
            Failed Attempts: {attempts.length}
          </Text>
        </VStack>

        <Icon as={IoSkull} boxSize="5" />
      </HStack>

      <Heading mt="2" size="sm" noOfLines={1} lineHeight="normal">
        Game Over!
      </Heading>

      <Text
        mt="1"
        fontSize="xs"
        lineHeight="none"
        fontWeight="medium"
        color="text.secondary"
      >
        Elapsed: {timeElapsed}
      </Text>

      <HStack mt="4" w="100%">
        <Button
          w="100%"
          variant="outline"
          colorScheme="gray"
          aria-label="Main Menu"
          onClick={onMenu}
        >
          Menu
        </Button>
        <Button w="100%" aria-label="Continue game" onClick={onContinue}>
          Continue
        </Button>
      </HStack>
    </GameMenuCard>
  );
};

export default GameOver;
