import { GetServerSidePropsContext } from 'next';

import { Response } from '@/types/api';
import { Game } from '@/types/game';

/**
 * Creates game. Will be called in server side
 */
const createGame = async (ctx: GetServerSidePropsContext) => {
  const puzzleID = ctx.query.id;
  const request = await fetch(`${process.env.API_URL}/games/${puzzleID}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      cookie: ctx.req.headers.cookie || '',
    },
  });
  const json: Response<Game> = await request.json();
  return json;
};

export default createGame;
