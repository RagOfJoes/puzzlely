import type { Response } from "@/types/api";

import APIError from "./error";

/**
 * Deletes a puzzle. Will be called in client side
 */
async function deletePuzzle(id: string): Promise<boolean> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/${id}`,
    {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const json: Response<undefined> = await request.json();
  // TODO: Capture error
  if (!json.success) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }

  return json.success;
}

export default deletePuzzle;
