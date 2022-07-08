import {
  Box,
  HStack,
  StackDivider,
  Text,
  useColorModeValue,
  useTheme,
} from '@chakra-ui/react';
import { transparentize } from '@chakra-ui/theme-tools';

export type GameAttemptCardProps = {
  attempt: string[];
};

const GameAttemptCard = (props: GameAttemptCardProps) => {
  const { attempt } = props;

  const theme = useTheme();
  const bgColor = useColorModeValue(
    'red.100',
    transparentize('red.200', 0.16)(theme)
  );
  const color = useColorModeValue('red.800', 'red.200');

  return (
    <Box p="2" w="100%" bgColor={bgColor} borderRadius="lg">
      <HStack w="100%" divider={<StackDivider />}>
        {attempt.map((str) => (
          <Text
            as="s"
            key={str}
            noOfLines={1}
            color={color}
            fontSize="sm"
            fontWeight="medium"
          >
            {str}
          </Text>
        ))}
      </HStack>
    </Box>
  );
};

export default GameAttemptCard;
