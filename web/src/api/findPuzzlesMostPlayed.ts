import { Response } from '@/types/api';
import { PuzzleConnection } from '@/types/puzzle';

import APIError from './error';

/**
 * Fetches most played puzzles. Will be called in client side
 */
const findPuzzlesMostPlayed = async () => {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/mostPlayed`,
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

export default findPuzzlesMostPlayed;
