import { Dispatch, SetStateAction, useEffect } from 'react';

import dayjs from 'dayjs';

import { Game } from '@/types/game';

import { UseTimerReturn } from './useTimer';
import useWindowFocus from './useWindowFocus';

export type UseGameFocusParam = {
  game: Game;
  isGameOver: boolean;
  isRunning: boolean;
  pause: UseTimerReturn['pause'];
  setGame: Dispatch<SetStateAction<Game>>;
  start: UseTimerReturn['start'];
  time: UseTimerReturn['time'];
};

/**
 * When user focuses/refocuses tab or window, then, will:
 * - If focuses on another tab or window, pause game
 * - If refocuses on tab or window:
 *    - Update startedAt to fall within timeAllowed config
 *    - Start timer
 */
const useGameFocus = (args: UseGameFocusParam) => {
  const { game, isGameOver, isRunning, pause, setGame, start, time } = args;

  const isFocused = useWindowFocus();

  return useEffect(() => {
    if (!game.startedAt || (game.guessedAt && game.startedAt)) {
      return;
    }

    if (!isFocused) {
      pause();
      return;
    }

    if (!isGameOver && !isRunning) {
      const newStartedAt = dayjs().tz().subtract(time, 'milliseconds').toDate();
      setGame((prev) => ({ ...prev, startedAt: newStartedAt }));

      start();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.startedAt, isGameOver, isFocused, isRunning, time]);
};

export default useGameFocus;
