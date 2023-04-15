import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import dayjs from "dayjs";
import shuffle from "lodash.shuffle";

import { UNLIMITED_TIME_ALLOWED } from "@/lib/constants";
import type { Game } from "@/types/game";
import type { Block } from "@/types/puzzle";

export type UseGameResetParams = {
  blocks: Block[];
  completedAt: Game["completedAt"];
  guessedAt: Game["guessedAt"];
  reset: () => void;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  setCorrect: Dispatch<SetStateAction<Game["correct"]>>;
  setGame: Dispatch<SetStateAction<Game>>;
  setSelected: Dispatch<SetStateAction<Block[]>>;
  start: () => void;
  startedAt: Game["startedAt"];
  timeAllowed: Game["config"]["timeAllowed"];
};

/**
 * When User retries during the Game.
 */
function useGameReset(args: UseGameResetParams) {
  const {
    blocks,
    completedAt,
    guessedAt,
    reset,
    setBlocks,
    setCorrect,
    setGame,
    setSelected,
    start,
    startedAt,
    timeAllowed,
  } = args;

  return useCallback(() => {
    const isCompleted = !!guessedAt || !!completedAt;
    if (!startedAt || isCompleted) {
      return;
    }

    // Reset `game` state
    setGame((prev) => ({
      ...prev,
      score: 0,
      attempts: [],
      correct: [],
      guessedAt: null,
      completedAt: null,
      startedAt: dayjs().tz().toDate(),
    }));

    // Reset local states
    setSelected([]);
    setBlocks(shuffle(blocks));
    setCorrect([]);

    // Reset timer if its running
    if (timeAllowed !== UNLIMITED_TIME_ALLOWED) {
      reset();
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeAllowed, completedAt, guessedAt, startedAt]);
}

export default useGameReset;
