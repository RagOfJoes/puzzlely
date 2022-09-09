import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import he from 'he';

import APIError, { APIErrorCode } from '@/api/error';
import { generateQueryKey } from '@/lib/queryKeys';
import { Game } from '@/types/game';

const useGame = (id: string): UseQueryResult<Game, APIError> => {
  const queryClient = useQueryClient();

  return useQuery<Game, APIError>(
    generateQueryKey.Game(id),
    async ({ queryKey }) => {
      const cached = queryClient.getQueryData<Game>(queryKey);
      if (!cached) {
        throw new APIError(APIErrorCode.NotFound, 'Game not found.');
      }
      return cached;
    },
    {
      retry: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      select: (game) => {
        if (!game) {
          return game;
        }

        return {
          ...game,
          puzzle: {
            ...game.puzzle,
            description: game.puzzle.description
              ? he.decode(game.puzzle.description, {
                  strict: true,
                })
              : game.puzzle.description,
            groups: game.puzzle.groups.map((group) => ({
              ...group,
              description: he.decode(group.description, { strict: true }),
            })),
          },
        };
      },
      // TODO: Capture error
      onError: async () => {},
    }
  );
};

export default useGame;
