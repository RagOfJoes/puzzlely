import type { ParsedUrlQuery } from "querystring";

import type { GetServerSidePropsContext, PreviewData } from "next";

import type { Response } from "@/types/api";
import type { Game } from "@/types/game";

/**
 * Fetches game. Will be called in server side
 */
async function findGame(
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
): Promise<Response<Game>> {
  const gameID = ctx.query.id;
  const request = await fetch(`${process.env.API_URL}/games/${gameID}`, {
    credentials: "include",
    headers: {
      cookie: ctx.req.headers.cookie || "",
    },
  });

  const json: Response<Game> = await request.json();
  return json;
}

export default findGame;
