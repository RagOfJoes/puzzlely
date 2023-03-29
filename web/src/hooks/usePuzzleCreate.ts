import { useToast } from "@chakra-ui/react";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

import api from "@/api";
import APIError, { APIErrorCode } from "@/api/error";
import useMe from "@/hooks/useMe";
import { ERR_UNAUTHORIZED } from "@/lib/constants";
import { generateQueryKey, queryKeys } from "@/lib/queryKeys";
import type {
  Puzzle,
  PuzzleConnection,
  PuzzleNode,
  PuzzleCreatePayload,
} from "@/types/puzzle";
import type { UserStats } from "@/types/user";

function usePuzzleCreate() {
  const toast = useToast();
  const router = useRouter();
  const { data: me } = useMe();
  const queryClient = useQueryClient();

  const createdKey = generateQueryKey.PuzzlesCreated(me?.id || "");
  const statsKey = generateQueryKey.UsersStats(me?.id || "");

  return useMutation<Puzzle, APIError, PuzzleCreatePayload>(
    async (newPuzzle) => {
      if (!me) {
        throw new APIError(APIErrorCode.Unauthorized, ERR_UNAUTHORIZED);
      }
      return api.createPuzzle(newPuzzle);
    },
    {
      retry: false,
      onError: async (err) => {
        if (err.code === APIErrorCode.Unauthorized || !me) {
          router.push("/login");
          return;
        }

        // Render toast
        toast({
          duration: 3000,
          status: "error",
          isClosable: false,
          title: err.message,
        });
      },
      onSuccess: async (newPuzzle) => {
        const hasCachedCreated = queryClient.getQueryState<
          InfiniteData<PuzzleConnection>,
          APIError
        >(createdKey);
        const hasCachedStats = queryClient.getQueryState<UserStats, APIError>(
          statsKey
        );

        // Update queries that are already cached
        if (hasCachedCreated) {
          queryClient.setQueryData<InfiniteData<PuzzleConnection> | undefined>(
            createdKey,
            (old) => {
              if (!old || !old.pages[0]) {
                return old;
              }

              const newCursor = Buffer.from(
                `Cursor:${newPuzzle.createdAt}`
              ).toString("base64");
              const newNode: PuzzleNode = {
                id: newPuzzle.id,
                name: newPuzzle.name,
                difficulty: newPuzzle.difficulty,
                maxAttempts: newPuzzle.maxAttempts,
                timeAllowed: newPuzzle.timeAllowed,
                numOfLikes: newPuzzle.numOfLikes,
                likedAt: newPuzzle.likedAt,
                createdAt: newPuzzle.createdAt,
                updatedAt: newPuzzle.updatedAt,
                createdBy: newPuzzle.createdBy,
              };
              const newPages = old.pages.map((page, index) => {
                if (index !== 0) {
                  return page;
                }
                return {
                  ...page,
                  edges: [
                    {
                      cursor: newCursor,
                      node: newNode,
                    },
                    ...page.edges,
                  ],
                };
              });

              return { ...old, pages: newPages };
            }
          );
        }
        if (hasCachedStats) {
          queryClient.setQueryData<UserStats | undefined>(statsKey, (old) => {
            if (!old) {
              return old;
            }

            return {
              ...old,
              puzzlesCreated: old.puzzlesCreated + 1,
            };
          });
        }

        // Reset Puzzles List query
        await queryClient.resetQueries(
          {
            exact: false,
            queryKey: queryKeys.PuzzlesList,
          },
          { cancelRefetch: true }
        );

        // Redirect to Profile page
        router.push("/profile");
      },
    }
  );
}

export default usePuzzleCreate;
