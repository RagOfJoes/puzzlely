import { Response } from '@/types/api';
import { Puzzle, PuzzleUpdatePayload } from '@/types/puzzle';

import APIError from './error';

/**
 * Updates puzzle. Will be called in client side
 */
const updatePuzzle = async (id: string, puzzle: PuzzleUpdatePayload) => {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/${id}`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(puzzle),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const json: Response<Puzzle> = await request.json();
  // TODO: Capture error
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }
  return json.payload;
};

export default updatePuzzle;
