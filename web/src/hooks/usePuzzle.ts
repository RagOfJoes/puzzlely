import he from 'he';
import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import APIError, { APIErrorCode } from '@/api/error';
import { generateQueryKey } from '@/lib/queryKeys';
import { Puzzle } from '@/types/puzzle';

const usePuzzle = (id: string): UseQueryResult<Puzzle, APIError> => {
  const queryClient = useQueryClient();

  return useQuery<Puzzle, APIError>(
    generateQueryKey.PuzzleDetail(id),
    async ({ queryKey }) => {
      const cached = queryClient.getQueryData<Puzzle>(queryKey);
      if (!cached) {
        throw new APIError(APIErrorCode.NotFound, 'Puzzle not found.');
      }
      return cached;
    },
    {
      retry: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      select: (puzzle) => {
        if (!puzzle) {
          return puzzle;
        }

        const newPuzzle = puzzle;
        newPuzzle.description = puzzle.description
          ? he.decode(puzzle.description, {
              strict: true,
            })
          : puzzle.description;
        newPuzzle.groups = puzzle.groups.map((group) => ({
          ...group,
          description: he.decode(group.description, {
            strict: true,
          }),
        }));

        return newPuzzle;
      },
      // TODO: Capture error
      onError: async () => {},
    }
  );
};

export default usePuzzle;
