import { useToast } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import api from '@/api';
import APIError, { APIErrorCode } from '@/api/error';
import { ERR_UNAUTHORIZED } from '@/lib/constants';
import { generateQueryKey, queryKeys } from '@/lib/queryKeys';

import useMe from './useMe';

const usePuzzleDelete = () => {
  const toast = useToast();
  const router = useRouter();
  const { data: me } = useMe();
  const queryClient = useQueryClient();

  return useMutation<boolean, APIError, string>(
    async (id) => {
      if (!me) {
        throw new APIError(APIErrorCode.Unauthorized, ERR_UNAUTHORIZED);
      }
      return api.deletePuzzle(id);
    },
    {
      retry: false,
      onError: async (err) => {
        if (err.code === APIErrorCode.Unauthorized || !me) {
          router.push('/login');
          return;
        }

        // Render toast
        toast({
          duration: 3000,
          status: 'error',
          isClosable: false,
          title: err.message,
        });
      },
      onSuccess: async () => {
        // Reset Game and Puzzle queries
        const resetCreated = queryClient.resetQueries({
          exact: true,
          queryKey: generateQueryKey.PuzzlesCreated(me?.id ?? ''),
        });
        const resetGamesPlayed = queryClient.resetQueries({
          exact: false,
          queryKey: queryKeys.GamesHistory,
        });
        const resetLiked = queryClient.resetQueries({
          exact: false,
          queryKey: queryKeys.PuzzlesLiked,
        });
        const resetList = queryClient.resetQueries(
          {
            exact: false,
            queryKey: queryKeys.PuzzlesList,
          },
          { cancelRefetch: true }
        );
        const resetStats = queryClient.resetQueries(
          {
            exact: true,
            queryKey: generateQueryKey.UsersStats(me?.id || ''),
          },
          {
            cancelRefetch: true,
          }
        );

        await Promise.all([
          resetCreated,
          resetGamesPlayed,
          resetLiked,
          resetList,
          resetStats,
        ]);

        // Redirect to profile page
        router.push('/profile');
      },
    }
  );
};

export default usePuzzleDelete;
