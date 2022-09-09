import { useToast } from '@chakra-ui/react';
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import api from '@/api';
import APIError from '@/api/error';
import { ERR_FAILED_UPDATE_GAME } from '@/lib/constants';
import { generateQueryKey } from '@/lib/queryKeys';
import {
  Game,
  GameConnection,
  GameEdge,
  GameUpdatePayload,
  GameUpdateResponse,
} from '@/types/game';
import { UserStats } from '@/types/user';

const useGameComplete = (id: string) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const gameKey = generateQueryKey.Game(id);
  return useMutation<
    GameUpdateResponse,
    APIError,
    { game: Game; update: GameUpdatePayload },
    {
      previous: Game | undefined;
    }
  >(({ update }) => api.completeGame(id, update), {
    retry: false,
    onError: async (_, __, context) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(gameKey);

      // Rollback cache
      queryClient.setQueryData(gameKey, () => context?.previous);

      // Render toast
      toast({
        duration: 3000,
        status: 'error',
        isClosable: false,
        title: ERR_FAILED_UPDATE_GAME,
      });
    },
    onMutate: async ({ game, update }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(gameKey);

      // Snapshot previous value
      const previous = queryClient.getQueryData<Game>(gameKey);
      // Update cached data
      queryClient.setQueryData<Game | undefined>(gameKey, (old) => {
        if (!old) {
          return old;
        }

        return { ...game, ...update };
      });

      return { previous };
    },
    onSuccess: async (updatedGame, { game }) => {
      if (!game.user) {
        return;
      }

      const userID = game.user.id;

      const historyKey = generateQueryKey.GamesHistory(userID);
      const statsKey = generateQueryKey.UsersStats(userID);

      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      const cancelPlayed = queryClient.cancelQueries(historyKey);
      const cancelStats = queryClient.cancelQueries(statsKey);
      await Promise.all([cancelPlayed, cancelStats]);

      // Update Games Played cached data
      const hasCachedPlayed = queryClient.getQueryState<
        InfiniteData<GameConnection>,
        APIError
      >(historyKey);
      if (hasCachedPlayed) {
        queryClient.setQueryData<InfiniteData<GameConnection> | undefined>(
          historyKey,
          (old) => {
            if (!old || old.pages.length === 0) {
              return old;
            }

            const newPages = old.pages.map((page, index) => {
              if (index !== 0) {
                return page;
              }

              const newEdges: GameEdge[] = [
                {
                  cursor: Buffer.from(
                    `Cursor:${updatedGame.createdAt}`
                  ).toString('base64'),
                  node: {
                    id: updatedGame.id,
                    score: updatedGame.score,
                    config: updatedGame.config,
                    challengeCode: updatedGame.challengeCode,
                    attempts: updatedGame.attempts.length,
                    createdAt: updatedGame.createdAt,
                    startedAt: updatedGame.startedAt,
                    guessedAt: updatedGame.guessedAt,
                    completedAt: updatedGame.completedAt,
                    puzzle: {
                      id: game.puzzle.id,
                      name: game.puzzle.name,
                      likedAt: game.puzzle.likedAt,
                      numOfLikes: game.puzzle.numOfLikes,
                      difficulty: game.puzzle.difficulty,
                      maxAttempts: game.puzzle.maxAttempts,
                      timeAllowed: game.puzzle.timeAllowed,
                      createdAt: game.puzzle.createdAt,
                      updatedAt: game.puzzle.updatedAt,
                      createdBy: game.puzzle.createdBy,
                    },
                  },
                },
                ...page.edges,
              ];
              return {
                ...page,
                edges: newEdges,
              };
            });

            return {
              ...old,
              pages: newPages,
            };
          }
        );
      }

      // Update User Stats cached data
      const hasCachedStats = queryClient.getQueryState<UserStats, APIError>(
        statsKey
      );
      if (hasCachedStats) {
        queryClient.setQueryData<UserStats | undefined>(statsKey, (old) => {
          if (!old) {
            return old;
          }

          return {
            ...old,
            gamesPlayed: old.gamesPlayed + 1,
          };
        });
      }
    },
  });
};

export default useGameComplete;
