import { Dispatch, SetStateAction, useCallback } from 'react';

import dayjs from 'dayjs';

import { UNLIMITED_TIME_ALLOWED } from '@/lib/constants';
import { Game } from '@/types/game';

export type UseGameStartParam = {
  isRunning: boolean;
  setGame: Dispatch<SetStateAction<Game>>;
  start: () => void;
  startedAt: Game['startedAt'];
  timeAllowed: Game['config']['timeAllowed'];
};

/**
 * When User starts the Game
 */
const useGameStart = (args: UseGameStartParam) => {
  const { isRunning, setGame, start, startedAt, timeAllowed } = args;
  return useCallback(() => {
    if (startedAt || isRunning) {
      return;
    }

    setGame((prev) => ({
      ...prev,
      startedAt: dayjs().tz().toDate(),
    }));

    if (timeAllowed !== UNLIMITED_TIME_ALLOWED) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, startedAt, timeAllowed]);
};

export default useGameStart;
