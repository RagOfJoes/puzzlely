import type { GetServerSidePropsContext } from "next";

import type { Response } from "@/types/api";
import type { Game } from "@/types/game";

/**
 * Creates game. Will be called in server side
 */
async function createGame(
  ctx: GetServerSidePropsContext
): Promise<Response<Game>> {
  const puzzleID = ctx.query.id;
  const request = await fetch(`${process.env.API_URL}/games/${puzzleID}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      cookie: ctx.req.headers.cookie || "",
    },
  });

  const json: Response<Game> = await request.json();
  return json;
}

export default createGame;
