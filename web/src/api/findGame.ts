import { ParsedUrlQuery } from 'querystring';

import { GetServerSidePropsContext, PreviewData } from 'next';

import { Response } from '@/types/api';
import { Game } from '@/types/game';

/**
 * Fetches game. Will be called in server side
 */
const findGame = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const gameID = ctx.query.id;
  const request = await fetch(`${process.env.API_URL}/games/${gameID}`, {
    credentials: 'include',
    headers: {
      cookie: ctx.req.headers.cookie || '',
    },
  });
  const json: Response<Game> = await request.json();
  return json;
};

export default findGame;
