import { QueryKey, useInfiniteQuery } from '@tanstack/react-query';

import api from '@/api';
import APIError from '@/api/error';
import { PUZZLES_LIMIT } from '@/lib/constants';
import { PuzzleConnection, PuzzleFilters } from '@/types/puzzle';

const usePuzzles = (
  queryKey: QueryKey,
  params: {
    filters: { [key in PuzzleFilters]?: string };
  }
) => {
  return useInfiniteQuery<PuzzleConnection, APIError>(
    queryKey,
    async ({ pageParam = '' }) => {
      const { filters } = params;

      return api.findPuzzles(
        { limit: PUZZLES_LIMIT, cursor: pageParam },
        filters
      );
    },
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

export default usePuzzles;
