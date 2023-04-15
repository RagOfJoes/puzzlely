import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import shuffle from "lodash.shuffle";

import { UNLIMITED_TIME_ALLOWED } from "@/lib/constants";
import type { Game } from "@/types/game";
import type { Block } from "@/types/puzzle";

export type UseGameMenuParams = {
  blocks: Block[];
  reset: () => void;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  setCorrect: Dispatch<SetStateAction<Game["correct"]>>;
  setGame: Dispatch<SetStateAction<Game>>;
  setSelected: Dispatch<SetStateAction<Block[]>>;
  startedAt: Game["startedAt"];
  timeAllowed: Game["config"]["timeAllowed"];
  toggleIsGameOver: Dispatch<SetStateAction<boolean>>;
};

/**
 * When User wants to go back to MainMenu from GameOver screen.
 */
function useGameMenu(args: UseGameMenuParams) {
  const {
    blocks,
    startedAt,
    timeAllowed,
    reset,
    setBlocks,
    setCorrect,
    setGame,
    setSelected,
    toggleIsGameOver,
  } = args;

  return useCallback(() => {
    if (!startedAt) {
      return;
    }

    // Reset `game` state
    setGame((prev) => ({
      ...prev,
      score: 0,
      attempts: [],
      correct: [],
      startedAt: null,
      guessedAt: null,
      completedAt: null,
    }));

    // Reset local state
    setBlocks(shuffle(blocks));
    setCorrect([]);
    setSelected([]);
    toggleIsGameOver(false);

    // Reset timer if possible
    if (timeAllowed !== UNLIMITED_TIME_ALLOWED) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, timeAllowed]);
}

export default useGameMenu;
