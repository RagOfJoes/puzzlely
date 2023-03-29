import { useQuery } from "@tanstack/react-query";

import api from "@/api";
import type APIError from "@/api/error";
import { generateQueryKey } from "@/lib/queryKeys";
import type { PuzzleConnection } from "@/types/puzzle";

function usePuzzlesMostPlayed() {
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
}

export default usePuzzlesMostPlayed;
