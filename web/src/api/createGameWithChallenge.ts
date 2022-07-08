import { GetServerSidePropsContext } from 'next';

import { Response } from '@/types/api';
import { Game } from '@/types/game';

/**
 * Creates a game with a challenge code. Will be called in server side
 */
const createGameWithChallenge = async (ctx: GetServerSidePropsContext) => {
  const challengeCode = ctx.query.challengeCode;
  const request = await fetch(
    `${process.env.API_URL}/games/challenge/${challengeCode}`,
    {
      method: 'PUT',
      credentials: 'include',
      headers: {
        cookie: ctx.req.headers.cookie || '',
      },
    }
  );
  const json: Response<Game> = await request.json();
  return json;
};

export default createGameWithChallenge;
