import { useMemo, useState } from 'react';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  StackDivider,
  Text,
  VStack,
} from '@chakra-ui/react';
import { IoGrid } from 'react-icons/io5';

import GameMenuCard from '@/components/GameMenuCard';
import { ConnectMenuProps } from '@/containers/Game';
import { UseGameConnectConnection } from '@/hooks/useGameConnect';
import groupBy from '@/lib/groupBy';

const Connect = (props: ConnectMenuProps) => {
  const { blocks, game, onConnect } = props;
  const { attempts, completedAt, puzzle, score } = game;

  const [connected, setConnected] = useState<UseGameConnectConnection>(() => {
    const init: UseGameConnectConnection = {};
    puzzle.groups.forEach((group) => {
      init[group.id] = { guess: '' };
    });
    return init;
  });

  const grouped = useMemo(
    () => groupBy(blocks, (block) => block.groupID),
    [blocks]
  );
  const connectedAll = useMemo(() => {
    if (game.completedAt) {
      return true;
    }

    const keys = Object.keys(connected);
    return (
      keys
        .map((key) => connected[key]?.guess || '')
        .filter((guess) => guess.trim().length === 0).length === 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

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

        <Icon as={IoGrid} />
      </HStack>

      <Heading mt="2" size="sm" noOfLines={1} lineHeight="normal">
        Guess connections
      </Heading>

      {grouped.map((block) => {
        const groupID = block[0]?.groupID;
        const values = block.map((b) => b.value);

        if (!groupID) {
          return null;
        }

        return (
          <Box mt="4" w="100%" key={groupID}>
            <FormControl isDisabled={!!completedAt}>
              <FormLabel>
                <HStack divider={<StackDivider />}>
                  {values.map((v) => (
                    <Text fontSize="sm" key={`${groupID}-${v}`}>
                      {v}
                    </Text>
                  ))}
                </HStack>
              </FormLabel>
              <Input
                placeholder="Answer here"
                value={connected[groupID]?.guess || ''}
                onChange={(e) =>
                  setConnected((prev) => ({
                    ...prev,
                    [groupID]: {
                      guess: e.target.value,
                    },
                  }))
                }
              />
            </FormControl>
          </Box>
        );
      })}

      <HStack mt="4" w="100%">
        <Button
          w="100%"
          aria-label="Submit guesses"
          disabled={!!completedAt || !connectedAll}
          onClick={() => onConnect(connected)}
        >
          Submit
        </Button>
      </HStack>
    </GameMenuCard>
  );
};

export default Connect;
