import { useQuery } from "@tanstack/react-query";

import api from "@/api";
import type APIError from "@/api/error";
import { generateQueryKey } from "@/lib/queryKeys";
import type { PuzzleConnection } from "@/types/puzzle";

function usePuzzlesMostLiked() {
  return useQuery<PuzzleConnection, APIError>(
    generateQueryKey.PuzzlesMostLiked(),
    async () => {
      return api.findPuzzlesMostLiked();
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

export default usePuzzlesMostLiked;
