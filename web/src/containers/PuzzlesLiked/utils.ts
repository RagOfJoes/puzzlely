import { useToast } from '@chakra-ui/react';
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

import api from '@/api';
import APIError, { APIErrorCode } from '@/api/error';
import useMe from '@/hooks/useMe';
import { ERR_PUZZLE_LIKE, TOASTER_OPTS } from '@/lib/constants';
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from '@/lib/puzzleConnection';
import { generateQueryKey, queryKeys } from '@/lib/queryKeys';
import { PuzzleConnection, PuzzleLike, PuzzleNode } from '@/types/puzzle';
import { UserStats } from '@/types/user';

export const usePuzzleLike = () => {
  const queryKey = generateQueryKey.PuzzlesLiked();

  const router = useRouter();
  const { data: me } = useMe();
  const toast = useToast(TOASTER_OPTS);
  const queryClient = useQueryClient();

  return useMutation<
    null | PuzzleLike,
    APIError,
    PuzzleNode,
    { previous: InfiniteData<PuzzleConnection> | undefined }
  >(
    async (puzzle) => {
      if (!me) {
        throw new APIError(
          APIErrorCode.Unauthorized,
          'You must be logged in to access this resource.'
        );
      }
      return api.togglePuzzleLike(puzzle.id);
    },
    {
      retry: false,
      // If the mutation fails, use the context return from onMutate to rollback cache
      onError: (err, _, context) => {
        if (err.code === APIErrorCode.Unauthorized) {
          router.push('/login');
          return;
        }

        toast({
          duration: 3000,
          status: 'error',
          isClosable: false,
          title: ERR_PUZZLE_LIKE,
        });
        queryClient.setQueryData(queryKey, context?.previous);
      },
      onMutate: async (puzzle) => {
        // Cancel any outgoing refetches so they don't overwrite our optimistic update
        await queryClient.cancelQueries(queryKey);
        // Snapshot the previous value
        const previous = queryClient.getQueryData<
          InfiniteData<PuzzleConnection> | undefined
        >(queryKey);
        // Update Puzzles List cached data
        if (!me) {
          return { previous };
        }
        queryClient.setQueryData<InfiniteData<PuzzleConnection> | undefined>(
          queryKey,
          (old) => {
            if (!old) {
              return old;
            }

            const now = dayjs().tz().toDate();
            const newPages = old.pages.map((page) => {
              const newEdges = page.edges
                .map((edge) => {
                  if (edge.node.id === puzzle.id) {
                    return {
                      ...edge,
                      node: {
                        ...edge.node,
                        likedAt: edge.node.likedAt ? null : now,
                        numOfLikes: edge.node.likedAt
                          ? edge.node.numOfLikes - 1
                          : edge.node.numOfLikes + 1,
                      },
                    };
                  }
                  return edge;
                })
                .filter((edge) => edge.node.likedAt);
              return {
                ...page,
                edges: newEdges,
              };
            });

            return { ...old, pages: newPages };
          }
        );

        return { previous };
      },
      onSuccess: async (like, puzzle) => {
        const statsKey = generateQueryKey.UsersStats(me!.id);
        const hasCachedStats = queryClient.getQueryState<UserStats, APIError>(
          statsKey
        );
        if (hasCachedStats) {
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

        const toggleMostPlayed = toggleLikePuzzleConnection(
          puzzle.id,
          queryClient,
          {
            exact: true,
            queryKey: generateQueryKey.PuzzlesMostPlayed(),
          }
        );
        const togglePuzzleCreated = toggleLikePuzzlePages(
          puzzle.id,
          queryClient,
          {
            exact: true,
            queryKey: generateQueryKey.PuzzlesCreated(puzzle.createdBy.id),
          }
        );
        const togglePuzzles = toggleLikePuzzlePages(puzzle.id, queryClient, {
          exact: false,
          queryKey: queryKeys.PuzzlesList,
        });

        await Promise.all([
          toggleMostPlayed,
          togglePuzzleCreated,
          togglePuzzles,
        ]);
      },
    }
  );
};
