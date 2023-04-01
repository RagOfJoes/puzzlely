import type { Response } from "@/types/api";
import type { GameUpdatePayload, GameUpdateResponse } from "@/types/game";

import APIError from "./error";

/**
 * Update game. Will be called in client-side
 */
async function guessGame(
  id: string,
  update: GameUpdatePayload
): Promise<GameUpdateResponse> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/games/guess/${id}`,
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(update),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const json: Response<GameUpdateResponse> = await request.json();
  // TODO: Capture error
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }

  return json.payload;
}

export default guessGame;
