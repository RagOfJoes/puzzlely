import type { Response } from "@/types/api";
import type { PuzzleConnection } from "@/types/puzzle";

import APIError from "./error";

/**
 * Fetches most played puzzles. Will be called in client side
 */
async function findPuzzlesMostPlayed(): Promise<PuzzleConnection> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/mostPlayed`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const json: Response<PuzzleConnection> = await request.json();
  // TODO: Capture error
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }

  return json.payload;
}

export default findPuzzlesMostPlayed;
