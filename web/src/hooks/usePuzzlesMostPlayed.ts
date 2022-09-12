import { useQuery } from '@tanstack/react-query';

import api from '@/api';
import APIError from '@/api/error';
import { generateQueryKey } from '@/lib/queryKeys';
import { PuzzleConnection } from '@/types/puzzle';

const usePuzzlesMostPlayed = () => {
  return useQuery<PuzzleConnection, APIError>(
    generateQueryKey.PuzzlesMostPlayed(),
    async () => {
      return api.findPuzzlesMostPlayed();
    },
    {
      // 60 minutes
      staleTime: 60000 * 60,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
};

export default usePuzzlesMostPlayed;
