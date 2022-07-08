import { Response } from '@/types/api';

import APIError from './error';

/**
 * Deletes a puzzle. Will be called in client side
 */
const deletePuzzle = async (id: string) => {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/${id}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const json: Response<undefined> = await request.json();
  if (!json.success) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }
  return json.success;
};

export default deletePuzzle;
