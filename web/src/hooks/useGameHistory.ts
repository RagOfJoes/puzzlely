import { useInfiniteQuery } from "@tanstack/react-query";

import api from "@/api";
import type APIError from "@/api/error";
import { GAMES_LIMIT } from "@/lib/constants";
import { generateQueryKey } from "@/lib/queryKeys";
import type { GameConnection } from "@/types/game";

function useGameHistory(userID: string) {
  return useInfiniteQuery<GameConnection, APIError>(
    generateQueryKey.GamesHistory(userID),
    async ({ pageParam = "" }) =>
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
}

export default useGameHistory;
