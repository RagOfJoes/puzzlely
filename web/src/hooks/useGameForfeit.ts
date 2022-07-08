import { Dispatch, SetStateAction, useCallback } from 'react';

import dayjs from 'dayjs';

import groupBy from '@/lib/groupBy';
import { Game } from '@/types/game';
import { Block } from '@/types/puzzle';

import useGameGuess from './useGameGuess';

export type UseGameForfeitParam = {
  blocks: Block[];
  correct: Game['correct'];
  game: Game;
  isGameOver: boolean;
  pause: () => void;
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  setCorrect: Dispatch<SetStateAction<Game['correct']>>;
  setGame: Dispatch<SetStateAction<Game>>;
  setSelected: Dispatch<SetStateAction<Block[]>>;
  toggleIsGameOver: Dispatch<SetStateAction<boolean>>;
  toggleIsWrong: Dispatch<SetStateAction<boolean>>;
};

/**
 * When User forfeits trying to link Blocks together
 */
const useGameForfeit = (args: UseGameForfeitParam) => {
  const {
    blocks,
    correct,
    game,
    isGameOver,
    pause,
    setBlocks,
    setCorrect,
    setGame,
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
    const now = dayjs().tz().toDate();

    if (!startedAt || guessedAt || completedAt || isGameOver) {
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

    pause();

    setGame((prev) => ({
      ...prev,
      guessedAt: now,
    }));

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
        guessedAt: now,
        results,
        score,
        startedAt,
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    attempts,
    completedAt,
    config,
    correct,
    guessedAt,
    isGameOver,
    score,
    startedAt,
  ]);
};

export default useGameForfeit;
