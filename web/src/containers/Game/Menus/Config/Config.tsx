import { useMemo } from 'react';

import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Icon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
  VStack,
} from '@chakra-ui/react';
import { IoSettings } from 'react-icons/io5';

import GameMenuCard from '@/components/GameMenuCard';
import { ConfigMenuProps } from '@/containers/Game';
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from '@/lib/constants';
import { millisecondsTo } from '@/lib/time';

const Config = (props: ConfigMenuProps) => {
  const { game, onMenu, onStart, onUpdateTimeAllowed, setGame } = props;
  const { config, challengedBy, puzzle } = game;

  const disableAttempts = !!challengedBy || puzzle.maxAttempts > 0;
  const disableTimeAllowed = !!challengedBy || puzzle.timeAllowed > 0;

  const onUpdateTimer = (newTime: number) => {
    if (disableTimeAllowed) {
      return;
    }

    setGame((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        timeAllowed: newTime,
      },
    }));
    onUpdateTimeAllowed(newTime);
  };

  const { minutes, seconds } = useMemo(
    () => ({
      minutes: millisecondsTo('minutes', config.timeAllowed),
      seconds: millisecondsTo('seconds', config.timeAllowed),
    }),
    [config.timeAllowed]
  );

  return (
    <GameMenuCard>
      <HStack w="100%" spacing="6" justify="space-between">
        <VStack w="100%" spacing="0" align="flex-start">
          <Text fontSize="sm" fontWeight="semibold">
            Settings
          </Text>
          <Text
            fontSize="xs"
            fontWeight="medium"
            letterSpacing="wide"
            color="text.secondary"
            textTransform="uppercase"
          >
            Update game settings
          </Text>
        </VStack>

        <Icon as={IoSettings} boxSize="5" />
      </HStack>

      <FormControl mt="2" isDisabled={disableAttempts}>
        <FormLabel>Number of Attempts</FormLabel>
        <NumberInput
          min={0}
          max={999}
          value={config.maxAttempts}
          onChange={(_, newValue) => {
            if (disableAttempts) {
              return;
            }

            setGame((prev) => ({
              ...prev,
              config: {
                ...prev.config,
                maxAttempts: Number.isNaN(newValue) ? 0 : newValue,
              },
            }));
          }}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <Button
        mt="2"
        size="sm"
        variant="link"
        colorScheme="gray"
        isDisabled={disableAttempts}
        onClick={() => {
          if (disableAttempts) {
            return;
          }

          setGame((prev) => ({
            ...prev,
            config: {
              ...prev.config,
              maxAttempts: UNLIMITED_MAX_ATTEMPTS,
            },
          }));
        }}
      >
        Unlimited Attempts
      </Button>

      <HStack mt="4" align="flex-end">
        <FormControl isDisabled={disableTimeAllowed}>
          <FormLabel>Time Limit</FormLabel>
          <NumberInput
            min={0}
            max={59}
            value={minutes}
            onChange={(_, newValue) => {
              const secToMs = seconds * 1000;
              const newTime = secToMs + newValue * 60000;
              onUpdateTimer(Number.isNaN(newTime) ? secToMs : newTime);
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>minutes</FormHelperText>
        </FormControl>

        <FormControl isDisabled={disableTimeAllowed}>
          <NumberInput
            min={0}
            max={59}
            value={seconds}
            onChange={(_, newValue) => {
              const minToMs = minutes * 60000;
              const newTime = minToMs + newValue * 1000;
              onUpdateTimer(Number.isNaN(newTime) ? minToMs : newTime);
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <FormHelperText>seconds</FormHelperText>
        </FormControl>
      </HStack>

      <Button
        mt="2"
        size="sm"
        variant="link"
        alignSelf="end"
        colorScheme="gray"
        isDisabled={disableTimeAllowed}
        onClick={() => {
          onUpdateTimer(UNLIMITED_TIME_ALLOWED);
        }}
      >
        Unlimited Time
      </Button>

      <HStack mt="4" w="100%">
        <Button
          w="100%"
          variant="outline"
          colorScheme="gray"
          aria-label="Main Menu"
          onClick={onMenu}
        >
          Back
        </Button>
        <Button w="100%" aria-label="Start game" onClick={onStart}>
          Start
        </Button>
      </HStack>
    </GameMenuCard>
  );
};

export default Config;
