import { Response } from '@/types/api';
import { PuzzleLike } from '@/types/puzzle';

import APIError from './error';

/**
 * Updates user. Will be called in client side
 */
const togglePuzzleLike = async (puzzleID: string) => {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/like/${puzzleID}`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const json: Response<PuzzleLike> = await request.json();
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }
  return json.payload;
};

export default togglePuzzleLike;
