import { Response } from '@/types/api';
import { UserStats } from '@/types/user';

import APIError from './error';

/**
 * Fetches user stats. Will be called in client side
 */
const findUserStats = async (userID: string) => {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/stats/${userID}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const json: Response<UserStats> = await request.json();
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }
  return json.payload;
};

export default findUserStats;
