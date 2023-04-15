import type { ParsedUrlQuery } from "querystring";

import type { GetServerSidePropsContext, PreviewData } from "next";

import type { Response } from "@/types/api";
import type { Puzzle } from "@/types/puzzle";

/**
 * Fetches puzzle. Will be called in server side
 */
async function findPuzzle(
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
): Promise<Response<Puzzle>> {
  const puzzleID = ctx.query.id;
  const request = await fetch(`${process.env.API_URL}/puzzles/${puzzleID}`, {
    credentials: "include",
    headers: {
      cookie: ctx.req.headers.cookie || "",
    },
  });

  const json: Response<Puzzle> = await request.json();
  return json;
}

export default findPuzzle;
