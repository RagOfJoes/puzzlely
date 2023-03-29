import { useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@/api";
import type APIError from "@/api/error";
import { ERR_FAILED_UPDATE_GAME } from "@/lib/constants";
import { generateQueryKey } from "@/lib/queryKeys";
import type { Game, GameUpdatePayload, GameUpdateResponse } from "@/types/game";

function useGameGuess(id: string) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const gameKey = generateQueryKey.Game(id);
  return useMutation<
    GameUpdateResponse,
    APIError,
    { game: Game; update: GameUpdatePayload },
    { previous: Game | undefined }
  >(({ update }) => api.guessGame(id, update), {
    retry: false,
    onError: async (_, __, context) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(gameKey);

      // Rollback cache
      queryClient.setQueryData(gameKey, () => context?.previous);

      // Render toast
      toast({
        duration: 3000,
        status: "error",
        isClosable: false,
        title: ERR_FAILED_UPDATE_GAME,
      });
    },
    onMutate: async ({ game, update }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(gameKey);

      // Snapshot previous value
      const previous = queryClient.getQueryData<Game>(gameKey);
      // Update cached data
      queryClient.setQueryData<Game | undefined>(gameKey, (old) => {
        if (!old) {
          return old;
        }

        return { ...game, ...update };
      });

      return { previous };
    },
  });
}

export default useGameGuess;
