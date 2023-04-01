import type { Response } from "@/types/api";
import type { Puzzle, PuzzleUpdatePayload } from "@/types/puzzle";

import APIError from "./error";

/**
 * Updates puzzle. Will be called in client side
 */
async function updatePuzzle(
  id: string,
  puzzle: PuzzleUpdatePayload
): Promise<Puzzle> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/${id}`,
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(puzzle),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const json: Response<Puzzle> = await request.json();
  // TODO: Capture error
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }

  return json.payload;
}

export default updatePuzzle;
