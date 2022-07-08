import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import APIError, { APIErrorCode } from '@/api/error';
import { generateQueryKey } from '@/lib/queryKeys';
import { User } from '@/types/user';

const useUser = (id: string): UseQueryResult<User, APIError> => {
  const queryClient = useQueryClient();

  return useQuery<User, APIError>(
    generateQueryKey.UsersProfile(id),
    async ({ queryKey }) => {
      const cached = queryClient.getQueryData<User>(queryKey);
      if (!cached) {
        throw new APIError(APIErrorCode.NotFound, 'User does not exist.');
      }
      return cached;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      notifyOnChangeProps: ['data', 'error'],
      // TODO: Capture error
      onError: async () => {},
    }
  );
};

export default useUser;
