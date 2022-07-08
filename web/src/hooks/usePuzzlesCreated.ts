import { useInfiniteQuery } from 'react-query';

import api from '@/api';
import APIError from '@/api/error';
import { PUZZLES_LIMIT } from '@/lib/constants';
import { generateQueryKey } from '@/lib/queryKeys';
import { PuzzleConnection } from '@/types/puzzle';

const usePuzzlesCreated = (userID: string) => {
  return useInfiniteQuery<PuzzleConnection, APIError>(
    generateQueryKey.PuzzlesCreated(userID),
    async ({ pageParam = '' }) =>
      api.findPuzzlesCreated(userID, PUZZLES_LIMIT, pageParam),
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

export default usePuzzlesCreated;
