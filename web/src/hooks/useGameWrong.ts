import { Dispatch, SetStateAction, useEffect } from 'react';

import { Block } from '@/types/puzzle';

export type UseGameWrongParams = {
  isWrong: boolean;
  setSelected: Dispatch<SetStateAction<Block[]>>;
  toggleIsWrong: Dispatch<SetStateAction<boolean>>;
};

/**
 * When `isWrong` is toggled to true this will set a timer to which, when done, will:
 * - Reset `selected` state
 * - Reset `isWrong` state to false
 */
const useGameWrong = (params: UseGameWrongParams) => {
  const { isWrong, setSelected, toggleIsWrong } = params;

  return useEffect(() => {
    if (!isWrong) {
      return;
    }

    let timeoutId: number | null = null;

    timeoutId = window.setTimeout(() => {
      setSelected([]);
      toggleIsWrong(false);
    }, 300);

    // eslint-disable-next-line consistent-return
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWrong]);
};

export default useGameWrong;
