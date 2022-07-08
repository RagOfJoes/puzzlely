import { Heading, HStack, Text } from '@chakra-ui/react';
import Link from 'next/link';

import { User } from '@/types/user';

export type GameChallengerResultsProps = {
  attempts: number;
  maxAttempts: number;
  maxScore: number;
  score: number;
  user?: User;
};

const GameChallengerResults = (props: GameChallengerResultsProps) => {
  const { attempts, maxAttempts, maxScore: numOfGroups, score, user } = props;

  return (
    <>
      <Heading size="xs">Challenger&apos;s results</Heading>

      <HStack mt="1" w="100%" justify="space-between">
        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
          Score
        </Text>
        <Text fontSize="sm" fontWeight="medium">
          {score}
          <Text
            as="small"
            fontSize="sm"
            fontWeight="medium"
            color="text.secondary"
          >
            {' / '}
            {numOfGroups}
          </Text>
        </Text>
      </HStack>
      <HStack mt="1" w="100%" justify="space-between">
        <Text fontSize="sm" fontWeight="medium" color="text.secondary">
          Attempts
        </Text>
        <Text fontSize="sm" fontWeight="medium">
          {attempts}
          <Text
            as="small"
            fontSize="sm"
            fontWeight="medium"
            color="text.secondary"
          >
            {' / '}
            {maxAttempts}
          </Text>
        </Text>
      </HStack>
      {!!user && (
        <HStack mt="1" w="100%" justify="space-between">
          <Text fontSize="sm" fontWeight="medium" color="text.secondary">
            Challenger
          </Text>
          <Link passHref href={`/users/${user.username}`}>
            <Text as="a" fontSize="sm" noOfLines={1} fontWeight="medium">
              {user.username}
            </Text>
          </Link>
        </HStack>
      )}
    </>
  );
};

export default GameChallengerResults;
