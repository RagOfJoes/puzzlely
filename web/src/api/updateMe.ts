import { Response } from '@/types/api';
import { UserUpdatePayload, User } from '@/types/user';

import APIError from './error';

/**
 * Updates user. Will be called in client side
 */
const updateMe = async (updates: UserUpdatePayload) => {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/update/`,
    {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(updates),
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const json: Response<User> = await request.json();
  // TODO: Capture error
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }
  return json.payload;
};

export default updateMe;
