import { SetStateAction } from 'react';

import {
  Button,
  Divider,
  HStack,
  Icon,
  Text,
  useClipboard,
  VStack,
} from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Link from 'next/link';
import { IoCheckbox, IoCopy } from 'react-icons/io5';

import GameChallengerResults from '@/components/GameChallengerResults';
import GameMenuCard from '@/components/GameMenuCard';
import LikeButton from '@/components/LikeButton';
import { ResultMenuProps } from '@/containers/Game';
import usePuzzleLike from '@/hooks/usePuzzleLike';
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from '@/lib/puzzleConnection';
import { generateQueryKey, queryKeys } from '@/lib/queryKeys';
import { Game } from '@/types/game';

import Attempts from './Attempts';
import Guesses from './Guesses';
import Overview from './Overview';

const Result = (props: ResultMenuProps) => {
  const { blocks, game, setGame } = props;
  const {
    attempts,
    completedAt,
    config,
    challengeCode,
    challengedBy,
    puzzle,
    results,
    score,
    startedAt,
  } = game;
  const { createdBy, groups, likedAt, name, numOfLikes } = puzzle;

  const { mutate } = usePuzzleLike();
  const queryClient = useQueryClient();
  const { hasCopied, onCopy } = useClipboard(
    `${process.env.NEXT_PUBLIC_HOST_URL}/games/challenge/${challengeCode}`,
    3000
  );

  return (
    <GameMenuCard>
      <HStack w="100%" justify="space-between">
        <VStack w="100%" spacing="0" align="flex-start">
          <Text fontSize="sm" fontWeight="semibold">
            {name}
          </Text>
          <Link passHref href={`/users/${createdBy.username}`}>
            <Text
              as="a"
              fontSize="xs"
              fontWeight="medium"
              color="text.secondary"
            >
              {createdBy.username}
            </Text>
          </Link>
        </VStack>

        <LikeButton
          isLiked={!!likedAt}
          numOfLikes={numOfLikes}
          onLike={() => {
            const now = dayjs().tz().toDate();
            const action: SetStateAction<Game> = (prev) => ({
              ...prev,
              puzzle: {
                ...prev.puzzle,
                likedAt: prev.puzzle.likedAt ? null : now,
                numOfLikes: prev.puzzle.likedAt
                  ? prev.puzzle.numOfLikes - 1
                  : prev.puzzle.numOfLikes + 1,
              },
            });
            setGame(action);

            mutate(puzzle, {
              onError: () => {
                setGame(action);
              },
              onSuccess: async () => {
                const toggleMostPlayed = toggleLikePuzzleConnection(
                  puzzle.id,
                  queryClient,
                  {
                    exact: true,
                    queryKey: generateQueryKey.PuzzlesMostPlayed(),
                  }
                );
                const togglePuzzleCreated = toggleLikePuzzlePages(
                  puzzle.id,
                  queryClient,
                  {
                    exact: true,
                    queryKey: generateQueryKey.PuzzlesCreated(
                      puzzle.createdBy.id
                    ),
                  }
                );
                const togglePuzzles = toggleLikePuzzlePages(
                  puzzle.id,
                  queryClient,
                  {
                    exact: false,
                    queryKey: queryKeys.PuzzlesList,
                  }
                );

                await Promise.all([
                  toggleMostPlayed,
                  togglePuzzleCreated,
                  togglePuzzles,
                ]);
              },
            });
          }}
        />
      </HStack>

      <Button
        mt="4"
        size="sm"
        width="100%"
        aria-label="Copy challenge code"
        leftIcon={<Icon as={hasCopied ? IoCheckbox : IoCopy} />}
        onClick={onCopy}
      >
        {hasCopied ? 'Copied!' : 'Challenge your friends.'}
      </Button>

      {!!challengedBy && (
        <>
          <Divider my="4" />
          <GameChallengerResults
            user={challengedBy.user}
            score={challengedBy.score}
            maxScore={groups.length * 2}
            attempts={challengedBy.attempts}
            maxAttempts={config.maxAttempts}
          />
          <Divider my="4" />
        </>
      )}

      <VStack mt="4" w="100%" spacing="4">
        <Overview
          completedAt={completedAt}
          puzzle={puzzle}
          score={score}
          startedAt={startedAt}
        />
        <Attempts attempts={attempts} blocks={blocks} />
        <Guesses blocks={blocks} puzzle={puzzle} results={results} />

        <Link passHref href="/puzzles">
          <Button w="100%" size="sm" aria-label="Back to puzzles">
            Back to Puzzles
          </Button>
        </Link>
      </VStack>
    </GameMenuCard>
  );
};

export default Result;
