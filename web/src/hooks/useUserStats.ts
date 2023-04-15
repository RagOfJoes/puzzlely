import type { UseQueryResult } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

import api from "@/api";
import type APIError from "@/api/error";
import { generateQueryKey } from "@/lib/queryKeys";
import type { UserStats } from "@/types/user";

function useUserStats(id: string): UseQueryResult<UserStats, APIError> {
  return useQuery<UserStats, APIError>(
    generateQueryKey.UsersStats(id),
    async () => api.findUserStats(id),
    {
      retry: false,
      // 60 minutes
      staleTime: 60000 * 60,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      // TODO: Capture error
      onError: async () => {},
    }
  );
}

export default useUserStats;
