import { ParsedUrlQuery } from 'querystring';

import { GetServerSidePropsContext, PreviewData } from 'next';

import { Response } from '@/types/api';
import { User } from '@/types/user';

/**
 * Fetches user. Will be called in server side
 */
const findUser = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const username = ctx.query.username;
  const request = await fetch(`${process.env.API_URL}/users/${username}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      cookie: ctx.req.headers.cookie || '',
    },
  });
  const json: Response<User> = await request.json();
  return json;
};

export default findUser;
