import { useRouter } from 'next/router';
import { useMutation, useQueryClient } from 'react-query';

import api from '@/api';
import APIError, { APIErrorCode } from '@/api/error';
import { ERR_UNAUTHORIZED } from '@/lib/constants';
import { updateGameConnection } from '@/lib/gameConnection';
import { updatePuzzlePages } from '@/lib/puzzleConnection';
import { generateQueryKey, queryKeys } from '@/lib/queryKeys';
import { GameNode } from '@/types/game';
import { PuzzleConnection, PuzzleNode } from '@/types/puzzle';
import { UserUpdatePayload, User } from '@/types/user';

import useMe from './useMe';

const useUserUpdate = () => {
  const router = useRouter();
  const { data: me } = useMe();
  const queryClient = useQueryClient();

  const gamesHistoryKey = generateQueryKey.GamesHistory(me?.id || '');
  const puzzleCreatedKey = generateQueryKey.PuzzlesCreated(me?.id || '');
  const puzzleLikedKey = generateQueryKey.PuzzlesLiked();
  const puzzleListKey = queryKeys.PuzzlesList;
  const meKey = generateQueryKey.Me();
  const searchKey = queryKeys.Search;

  return useMutation<
    User,
    APIError,
    { updates: UserUpdatePayload },
    { previous: User | undefined }
  >(
    async ({ updates }) => {
      if (!me) {
        throw new APIError(APIErrorCode.Unauthorized, ERR_UNAUTHORIZED);
      }
      return api.updateMe(updates);
    },
    {
      retry: false,
      onError: async (err, _, context) => {
        // Rollback cache
        queryClient.setQueryData(meKey, () => context?.previous);

        if (err.code === APIErrorCode.Unauthorized) {
          router.push('/login');
        }
      },
      onMutate: async ({ updates }) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(meKey);

        // Snapshot previous value
        const previous = queryClient.getQueryData<User>(meKey);

        queryClient.setQueryData<User | undefined>(meKey, (old) => {
          if (!old || !previous) {
            return old;
          }

          const newMe = {
            ...old,
            ...updates,
          };

          return { ...newMe };
        });

        return { previous };
      },
      onSuccess: async (result) => {
        // Update User based on result
        queryClient.setQueryData<User>(meKey, result);

        // Reset Puzzle Search query
        const resetSearch = queryClient.resetQueries<PuzzleConnection>({
          exact: false,
          queryKey: searchKey,
        });

        const updateGameNode = (node: GameNode): GameNode => {
          const newGame = { ...node };
          if (newGame.user && newGame.user.id === result.id) {
            newGame.user = result;
          }
          if (newGame.puzzle.createdBy.id === result.id) {
            newGame.puzzle.createdBy = result;
          }
          return newGame;
        };
        const updatePuzzleNode = (node: PuzzleNode): PuzzleNode => {
          if (node.createdBy.id !== result.id) {
            return node;
          }
          return {
            ...node,
            createdBy: result,
          };
        };
        // Update queries that are already cached
        const updateGameHistory = updateGameConnection(
          updateGameNode,
          queryClient,
          {
            exact: true,
            queryKey: gamesHistoryKey,
          }
        );
        const updatePuzzles = updatePuzzlePages(updatePuzzleNode, queryClient, {
          exact: false,
          queryKey: puzzleListKey,
        });
        const updatePuzzlesCreated = updatePuzzlePages(
          updatePuzzleNode,
          queryClient,
          {
            exact: true,
            queryKey: puzzleCreatedKey,
          }
        );
        const updatePuzzlesLiked = updatePuzzlePages(
          updatePuzzleNode,
          queryClient,
          {
            exact: true,
            queryKey: puzzleLikedKey,
          }
        );

        await Promise.all([
          resetSearch,
          updateGameHistory,
          updatePuzzles,
          updatePuzzlesCreated,
          updatePuzzlesLiked,
        ]);
      },
    }
  );
};

export default useUserUpdate;
