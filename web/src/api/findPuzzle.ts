import { ParsedUrlQuery } from 'querystring';

import { GetServerSidePropsContext, PreviewData } from 'next';

import { Response } from '@/types/api';
import { Puzzle } from '@/types/puzzle';

/**
 * Fetches puzzle. Will be called in server side
 */
const findPuzzle = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  const puzzleID = ctx.query.id;
  const request = await fetch(`${process.env.API_URL}/puzzles/${puzzleID}`, {
    credentials: 'include',
    headers: {
      cookie: ctx.req.headers.cookie || '',
    },
  });
  const json: Response<Puzzle> = await request.json();
  return json;
};

export default findPuzzle;
