import { NextApiRequest, NextApiResponse } from 'next';

import { Response } from '@/types/api';
import { Session } from '@/types/session';

/**
 * Fetches current owner of session. Will be called in server side
 */
const me = async (req: NextApiRequest, res: NextApiResponse) => {
  const request = await fetch(`${process.env.API_URL}/me/`, {
    credentials: 'include',
    headers: {
      cookie: req.headers.cookie || '',
    },
  });
  const cookies = request.headers.get('Set-Cookie');
  if (cookies) {
    res.setHeader('Set-Cookie', cookies);
  }
  const json: Response<Session> = await request.json();
  return json;
};

export default me;
