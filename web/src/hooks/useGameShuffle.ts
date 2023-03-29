import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import shuffle from "lodash.shuffle";

import type { Game } from "@/types/game";
import type { Block } from "@/types/puzzle";

export type UseGameShuffleParams = {
  blocks: Block[];
  completedAt: Game["completedAt"];
  correct: Game["correct"];
  guessedAt: Game["guessedAt"];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  startedAt: Game["startedAt"];
};

/**
 * When User shuffles blocks during the Game.
 */
function useGameShuffle(args: UseGameShuffleParams) {
  const { blocks, completedAt, correct, guessedAt, setBlocks, startedAt } =
    args;

  return useCallback(() => {
    const isCompleted = !!guessedAt || !!completedAt;
    if (!startedAt || isCompleted) {
      return;
    }

    // Separate correct and incorrect blocks
    const correctBlocks: Array<Block> = [];
    const incorrectBlocks = blocks.filter((b) => {
      const inCorrect = correct.includes(b.groupID);
      if (inCorrect) {
        correctBlocks.push(b);
      }
      return !inCorrect;
    });

    // Shuffle incorrect blocks
    const shuffled = shuffle(incorrectBlocks);
    const newBlocks = [...correctBlocks, ...shuffled];
    setBlocks(newBlocks);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, correct, completedAt, guessedAt, startedAt]);
}

export default useGameShuffle;
