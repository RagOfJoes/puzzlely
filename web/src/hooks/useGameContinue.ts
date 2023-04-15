import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import useGameGuess from "@/hooks/useGameGuess";
import groupBy from "@/lib/groupBy";
import type { Game } from "@/types/game";
import type { Block } from "@/types/puzzle";

export type UseGameContinueParam = {
  blocks: Block[];
  correct: Game["correct"];
  game: Game;
  isGameOver: boolean;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  setCorrect: Dispatch<SetStateAction<Game["correct"]>>;
  setSelected: Dispatch<SetStateAction<Block[]>>;
  toggleIsGameOver: Dispatch<SetStateAction<boolean>>;
  toggleIsWrong: Dispatch<SetStateAction<boolean>>;
};

/**
 * When User continues from GameOver screen
 */
function useGameContinue(args: UseGameContinueParam) {
  const {
    blocks,
    correct,
    game,
    isGameOver,
    setBlocks,
    setCorrect,
    setSelected,
    toggleIsGameOver,
    toggleIsWrong,
  } = args;
  const {
    attempts,
    completedAt,
    config,
    guessedAt,
    id,
    results,
    score,
    startedAt,
  } = game;

  const { mutate } = useGameGuess(id);

  return useCallback(() => {
    if (!isGameOver) {
      return;
    }

    // Get blocks that the user hasn't guessed correctly
    const newCorrect = [...correct];
    const filtered = blocks.filter((block) => {
      if (!newCorrect.includes(block.groupID)) {
        newCorrect.push(block.groupID);
      }
      return block.groupID;
    });
    const grouped = groupBy(filtered, (block) => {
      if (!newCorrect.includes(block.groupID)) {
        newCorrect.push(block.groupID);
      }
      return block.groupID;
    }).flat();

    setSelected([]);
    setCorrect(newCorrect);
    setBlocks([...grouped]);

    toggleIsWrong(false);
    toggleIsGameOver(false);

    mutate({
      game,
      update: {
        attempts,
        completedAt,
        config,
        correct: game.correct,
        guessedAt,
        results,
        score,
        startedAt,
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, config, correct, guessedAt, isGameOver, score, startedAt]);
}

export default useGameContinue;
