import { Response } from '@/types/api';
import { PuzzleCreatePayload, Puzzle } from '@/types/puzzle';

import APIError from './error';

/**
 * Creates a puzzle. Will be called in client side
 */
const createPuzzle = async (puzzle: PuzzleCreatePayload) => {
  const request = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/puzzles`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(puzzle),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const json: Response<Puzzle> = await request.json();
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }
  return json.payload;
};

export default createPuzzle;
