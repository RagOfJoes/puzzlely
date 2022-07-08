import { useInfiniteQuery } from 'react-query';

import api from '@/api';
import APIError from '@/api/error';
import { GAMES_LIMIT } from '@/lib/constants';
import { generateQueryKey } from '@/lib/queryKeys';
import { GameConnection } from '@/types/game';

const useGameHistory = (userID: string) => {
  return useInfiniteQuery<GameConnection, APIError>(
    generateQueryKey.GamesHistory(userID),
    async ({ pageParam = '' }) =>
      api.findGameHistory(userID, GAMES_LIMIT, pageParam),
    {
      // 30 minutes
      staleTime: 60000 * 30,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      getNextPageParam: (lastPage) => {
        if (!lastPage.pageInfo.hasNextPage) {
          return null;
        }
        return lastPage.pageInfo.cursor;
      },
    }
  );
};

export default useGameHistory;
