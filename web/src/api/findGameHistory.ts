import type { Response } from "@/types/api";
import type { GameConnection } from "@/types/game";

import APIError from "./error";

/**
 * Fetches user's game history. Will be called in client side
 */
async function findGameHistory(
  userID: string,
  limit: number,
  cursor?: string
): Promise<GameConnection> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/games/played/${userID}?limit=${limit}&cursor=${cursor}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const json: Response<GameConnection> = await request.json();
  // TODO: Capture error
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }

  return json.payload;
}

export default findGameHistory;
