import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

import api from "@/api";
import APIError, { APIErrorCode } from "@/api/error";
import useMe from "@/hooks/useMe";
import { ERR_UNAUTHORIZED } from "@/lib/constants";
import { updatePuzzlePages } from "@/lib/puzzleConnection";
import { generateQueryKey, queryKeys } from "@/lib/queryKeys";
import type {
  Puzzle,
  PuzzleConnection,
  PuzzleNode,
  PuzzleUpdatePayload,
} from "@/types/puzzle";

function usePuzzleUpdate(id: string) {
  const router = useRouter();
  const { data: me } = useMe();
  const queryClient = useQueryClient();

  const createdKey = generateQueryKey.PuzzlesCreated(me?.id || "");
  const likedKey = generateQueryKey.PuzzlesLiked();
  const listKey = queryKeys.PuzzlesList;
  const searchKey = queryKeys.Search;

  return useMutation<Puzzle, APIError, PuzzleUpdatePayload>(
    async (updatePuzzle) => {
      if (!me) {
        throw new APIError(APIErrorCode.Unauthorized, ERR_UNAUTHORIZED);
      }
      return api.updatePuzzle(id, updatePuzzle);
    },
    {
      retry: false,
      onError: async (err) => {
        if (err.code === APIErrorCode.Unauthorized || !me) {
          router.push("/login");
          return;
        }

        // Render toast
        toast.error(err.message);
      },
      onSuccess: async (updatedPuzzle) => {
        // Reset Puzzle Search query
        const resetSearch = queryClient.resetQueries<PuzzleConnection>({
          exact: false,
          queryKey: searchKey,
        });

        const newNode: PuzzleNode = {
          id: updatedPuzzle.id,
          name: updatedPuzzle.name,
          difficulty: updatedPuzzle.difficulty,
          description: updatedPuzzle.description,
          maxAttempts: updatedPuzzle.maxAttempts,
          timeAllowed: updatedPuzzle.timeAllowed,
          numOfLikes: updatedPuzzle.numOfLikes,
          likedAt: updatedPuzzle.likedAt,
          createdAt: updatedPuzzle.createdAt,
          updatedAt: updatedPuzzle.updatedAt,
          createdBy: updatedPuzzle.createdBy,
        };
        // Update queries that are already cached
        const updatePuzzles = updatePuzzlePages(newNode, queryClient, {
          exact: false,
          queryKey: listKey,
        });
        const updatePuzzlesCreated = updatePuzzlePages(newNode, queryClient, {
          exact: true,
          queryKey: createdKey,
        });
        const updatePuzzlesLiked = updatePuzzlePages(newNode, queryClient, {
          exact: true,
          queryKey: likedKey,
        });

        await Promise.all([
          resetSearch,
          updatePuzzles,
          updatePuzzlesCreated,
          updatePuzzlesLiked,
        ]);

        // Redirect to Profile page
        router.push("/profile");
      },
    }
  );
}

export default usePuzzleUpdate;
