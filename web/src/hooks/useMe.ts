import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import APIError, { APIErrorCode } from '@/api/error';
import { generateQueryKey } from '@/lib/queryKeys';
import { User } from '@/types/user';

const useMe = (): UseQueryResult<User, APIError> => {
  const queryClient = useQueryClient();

  const key = generateQueryKey.Me();
  return useQuery<User, APIError>(
    key,
    async ({ queryKey }) => {
      const cached = queryClient.getQueryData<User>(queryKey);
      if (!cached) {
        throw new APIError(APIErrorCode.Unauthorized, 'No active session.');
      }
      return cached;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      // TODO: Capture error
      onError: async (err) => {
        // Cancel any outgoing refetches so they don't overwrite our optimistic update
        await queryClient.cancelQueries(key);

        // Snapshot the previous value
        const previous = queryClient.getQueryData<User>(key);
        if (!previous || err.code !== APIErrorCode.Unauthorized) {
          return;
        }

        // Clear cache
        queryClient.setQueryData(key, () => undefined);
      },
    }
  );
};

export default useMe;
