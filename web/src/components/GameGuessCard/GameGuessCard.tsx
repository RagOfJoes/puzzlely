import { Box, HStack, StackDivider, Tag, Text, VStack } from '@chakra-ui/react';

export type GameGuessCardProps = {
  description: string;
  guess: string;
  isCorrect: boolean;
  values: string[];
};

const GameGuessCard = (props: GameGuessCardProps) => {
  const { description, guess, isCorrect, values } = props;

  return (
    <Box
      p="4"
      w="100%"
      borderRadius="lg"
      border="1px solid"
      borderColor="inherit"
    >
      <HStack w="100%" divider={<StackDivider />}>
        {values.map((value, index) => (
          <Text
            noOfLines={1}
            fontSize="sm"
            fontWeight="medium"
            key={`${value}__${index}`}
          >
            {value}
          </Text>
        ))}
      </HStack>
      <VStack
        mt="2"
        w="100%"
        spacing="1"
        align="flex-start"
        justify="space-between"
      >
        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
          Guess
        </Text>
        <Tag size="sm" colorScheme={isCorrect ? 'green' : 'red'}>
          <Text noOfLines={1} fontWeight="medium" as={isCorrect ? 'p' : 's'}>
            {guess}
          </Text>
        </Tag>
        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
          Description
        </Text>
        <Text fontSize="sm" fontWeight="medium">
          {description}
        </Text>
      </VStack>
    </Box>
  );
};

export default GameGuessCard;
