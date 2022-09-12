import { useToast } from '@chakra-ui/react';
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useRouter } from 'next/router';

import api from '@/api';
import APIError, { APIErrorCode } from '@/api/error';
import useMe from '@/hooks/useMe';
import { ERR_UNAUTHORIZED } from '@/lib/constants';
import { generateQueryKey } from '@/lib/queryKeys';
import { PuzzleConnection, PuzzleLike, PuzzleNode } from '@/types/puzzle';
import { UserStats } from '@/types/user';

const usePuzzleLike = () => {
  const toast = useToast();
  const router = useRouter();
  const { data: me } = useMe();
  const queryClient = useQueryClient();

  const likedKey = generateQueryKey.PuzzlesLiked();
  const statsKey = generateQueryKey.UsersStats(me?.id || '');

  return useMutation<PuzzleLike, APIError, PuzzleNode>(
    async (puzzle) => {
      if (!me) {
        throw new APIError(APIErrorCode.Unauthorized, ERR_UNAUTHORIZED);
      }
      return api.togglePuzzleLike(puzzle.id);
    },
    {
      retry: false,
      onError: (err) => {
        if (err.code === APIErrorCode.Unauthorized || !me) {
          router.push('/login');
          return;
        }

        // Render toast
        toast({
          duration: 3000,
          status: 'error',
          isClosable: false,
          title: err.message,
        });
      },
      onSuccess: async (like, puzzle) => {
        if (queryClient.getQueryState<UserStats, APIError>(statsKey)) {
          queryClient.setQueryData<UserStats | undefined>(statsKey, (old) => {
            if (!old || !like) {
              return old;
            }

            return {
              ...old,
              puzzlesLiked: like.active
                ? old.puzzlesLiked + 1
                : old.puzzlesLiked - 1,
            };
          });
        }

        if (
          queryClient.getQueryState<
            InfiniteData<PuzzleConnection> | undefined,
            APIError
          >(likedKey)
        ) {
          queryClient.setQueryData<InfiniteData<PuzzleConnection> | undefined>(
            likedKey,
            (old) => {
              if (!old) {
                return old;
              }
              if (!like.active) {
                return {
                  ...old,
                  pages: old.pages.map((page) => {
                    return {
                      ...page,
                      edges: page.edges.filter(
                        (edge) => edge.node.id !== puzzle.id
                      ),
                    };
                  }),
                };
              }

              const newData = { ...old };
              const newCursor = Buffer.from(
                `Cursor:${like.updatedAt!}`
              ).toString('base64');
              const updatedPuzzle: PuzzleNode = {
                ...puzzle,
                numOfLikes: puzzle.numOfLikes + 1,
                likedAt: like.updatedAt,
              };
              if (newData.pages[0]) {
                newData.pages[0] = {
                  ...newData.pages[0],
                  edges: [
                    { cursor: newCursor, node: updatedPuzzle },
                    ...newData.pages[0].edges,
                  ],
                };
              }
              return newData;
            }
          );
        }
      },
    }
  );
};

export default usePuzzleLike;
