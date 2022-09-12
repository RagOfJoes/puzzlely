import { useMemo } from 'react';

import {
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useFormikContext } from 'formik';

import FormikNumberInputControl from '@/components/FormikNumberInputControl';
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from '@/lib/constants';
import { millisecondsTo } from '@/lib/time';
import { PuzzleCreatePayload } from '@/types/puzzle';

const Settings = () => {
  const { isSubmitting, values, setFieldValue } =
    useFormikContext<PuzzleCreatePayload>();

  const { minutes, seconds } = useMemo(
    () => ({
      minutes: millisecondsTo('minutes', values.timeAllowed),
      seconds: millisecondsTo('seconds', values.timeAllowed),
    }),
    [values.timeAllowed]
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

      <VStack mt="4" w="100%" spacing="4" align="start">
        <FormikNumberInputControl
          name="maxAttempts"
          label="Max Attempts"
          isDisabled={isSubmitting}
          numberInputProps={{
            min: 0,
            max: 999,
            clampValueOnBlur: true,
            isDisabled: isSubmitting,
            onChange: (_, newValue) => {
              const newMaxAttempts = Number(newValue);

              setFieldValue(
                'maxAttempts',
                Number.isNaN(newMaxAttempts) ? 0 : newMaxAttempts
              );
            },
          }}
        />
        <Button
          mt="2"
          size="sm"
          variant="link"
          colorScheme="gray"
          disabled={isSubmitting}
          onClick={() => setFieldValue('maxAttempts', UNLIMITED_MAX_ATTEMPTS)}
        >
          Unlimited Attempts
        </Button>

        <HStack mt="2" w="100%" align="end">
          <FormikNumberInputControl
            name="timeAllowed"
            label="Time Limit"
            isDisabled={isSubmitting}
            helperText={`minute${minutes === 0 || minutes > 1 ? 's' : ''}`}
            numberInputProps={{
              min: 0,
              max: 59,
              value: minutes,
              isDisabled: isSubmitting,
              onChange: (_, newValue) => {
                let clamped = newValue;
                if (newValue > 59) {
                  clamped = 59;
                }

                const secToMs = seconds * 1000;
                const newTime = secToMs + clamped * 60000;

                setFieldValue(
                  'timeAllowed',
                  Number.isNaN(newTime) ? secToMs : newTime
                );
              },
            }}
          />
          <FormikNumberInputControl
            name="timeAllowed"
            isDisabled={isSubmitting}
            helperText={`second${seconds === 0 || seconds > 1 ? 's' : ''}`}
            numberInputProps={{
              min: 0,
              max: 59,
              value: seconds,
              isDisabled: isSubmitting,
              onChange: (_, newValue) => {
                let clamped = newValue;
                if (newValue > 59) {
                  clamped = 59;
                }

                const minToMs = minutes * 60000;
                const newTime = minToMs + clamped * 1000;

                setFieldValue(
                  'timeAllowed',
                  Number.isNaN(newTime) ? minToMs : newTime
                );
              },
            }}
          />
        </HStack>
        <Button
          mt="2"
          size="sm"
          variant="link"
          colorScheme="gray"
          disabled={isSubmitting}
          onClick={() => setFieldValue('timeAllowed', UNLIMITED_TIME_ALLOWED)}
        >
          Unlimited Time
        </Button>
      </VStack>
    </Box>
  );
};

export default Settings;
