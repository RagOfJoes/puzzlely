import { Dispatch, SetStateAction, useCallback } from 'react';

import dayjs from 'dayjs';

import useGameComplete from '@/hooks/useGameComplete';
import { Game } from '@/types/game';

export type UseGameConnectParam = {
  game: Game;
  setGame: Dispatch<SetStateAction<Game>>;
};

export type UseGameConnectConnection = {
  [groupID: string]: {
    guess: string;
  };
};

/**
 * When User submits guesses to group connections
 */
const useGameConnect = (args: UseGameConnectParam) => {
  const { game, setGame } = args;
  const {
    attempts,
    completedAt,
    config,
    correct,
    guessedAt,
    id,
    puzzle,
    score,
    startedAt,
  } = game;

  const { mutate } = useGameComplete(id);

  return useCallback(
    (connections: UseGameConnectConnection) => {
      const now = dayjs().tz().toDate();

      if (!startedAt || !guessedAt || completedAt) {
        return;
      }

      let correctCount = 0;
      const results: Game['results'] = [];
      puzzle.groups.forEach((group) => {
        const connection = connections[group.id];
        if (!connection) {
          return;
        }

        const isCorrect = group.answers.some((answer) => {
          const lowerAnswer = answer.toLowerCase();
          const lowerGuess = connection.guess.toLowerCase();
          if (answer.length < lowerGuess.length) {
            return lowerGuess.includes(lowerAnswer);
          }
          return lowerAnswer.includes(lowerGuess);
        });

        if (isCorrect) {
          correctCount += 1;
        }

        results.push({
          groupID: group.id,
          correct: isCorrect,
          guess: connection.guess,
        });
      });

      setGame((prev) => ({
        ...prev,
        completedAt: now,
        results,
        score: prev.score + correctCount,
      }));

      mutate({
        game,
        update: {
          attempts,
          completedAt: now,
          config,
          correct,
          guessedAt,
          results,
          score: score + correctCount,
          startedAt,
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attempts, completedAt, config, correct, guessedAt, score, startedAt]
  );
};

export default useGameConnect;
