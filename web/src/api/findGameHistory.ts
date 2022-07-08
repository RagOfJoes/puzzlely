import { Response } from '@/types/api';
import { GameConnection } from '@/types/game';

import APIError from './error';

/**
 * Fetches user's game history. Will be called in client side
 */
const findGameHistory = async (
  userID: string,
  limit: number,
  cursor?: string
) => {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/games/played/${userID}?limit=${limit}&cursor=${cursor}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const json: Response<GameConnection> = await request.json();
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }
  return json.payload;
};

export default findGameHistory;
