import type { Response } from "@/types/api";
import type { PuzzleConnection } from "@/types/puzzle";

import APIError from "./error";

/**
 * Fetches user's created puzzles. Will be called in client side
 */
async function findGameHistory(
  userID: string,
  limit: number,
  cursor?: string
): Promise<PuzzleConnection> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/created/${userID}?limit=${limit}&cursor=${cursor}`,
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

export default findGameHistory;
