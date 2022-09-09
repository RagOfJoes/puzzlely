import { useQuery, useQueryClient } from '@tanstack/react-query';

import APIError from '@/api/error';
import { generateQueryKey } from '@/lib/queryKeys';
import { PuzzleConnection } from '@/types/puzzle';

const useSearch = (term: string) => {
  const queryClient = useQueryClient();

  return useQuery<PuzzleConnection, APIError>(
    generateQueryKey.Search(term),
    async ({ queryKey }) => {
      const cached = queryClient.getQueryData<PuzzleConnection>(queryKey);
      if (!cached) {
        return { edges: [], pageInfo: { cursor: '', hasNextPage: false } };
      }
      return cached;
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
};

export default useSearch;
