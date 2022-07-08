import { Response } from '@/types/api';
import { PuzzleConnection } from '@/types/puzzle';

import APIError from './error';

/**
 * Fetches most liked puzzles. Will be called in client side
 */
const findPuzzlesMostLiked = async () => {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/mostLiked`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const json: Response<PuzzleConnection> = await request.json();
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }
  return json.payload;
};

export default findPuzzlesMostLiked;
