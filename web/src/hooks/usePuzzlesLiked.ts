import { useInfiniteQuery } from "@tanstack/react-query";

import api from "@/api";
import type APIError from "@/api/error";
import { PUZZLES_LIMIT } from "@/lib/constants";
import { generateQueryKey } from "@/lib/queryKeys";
import type { PuzzleConnection } from "@/types/puzzle";

function usePuzzlesLiked() {
  return useInfiniteQuery<PuzzleConnection, APIError>(
    generateQueryKey.PuzzlesLiked(),
    async ({ pageParam = "" }) => {
      return api.findPuzzlesLiked({ limit: PUZZLES_LIMIT, cursor: pageParam });
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
}

export default usePuzzlesLiked;
