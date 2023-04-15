import type { ParsedUrlQuery } from "querystring";

import type { GetServerSidePropsContext, PreviewData } from "next";

import type { Response } from "@/types/api";
import type { PuzzleConnection } from "@/types/puzzle";

/**
 * Searches for puzzles that have similar name and/or description. Will be called in server side
 */
async function search(
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
): Promise<Response<PuzzleConnection>> {
  const term = ctx.query.term;
  const request = await fetch(
    `${process.env.API_URL}/puzzles/search?term=${term}`,
    {
      credentials: "include",
      headers: {
        cookie: ctx.req.headers.cookie || "",
      },
    }
  );

  const json: Response<PuzzleConnection> = await request.json();
  return json;
}

export default search;
