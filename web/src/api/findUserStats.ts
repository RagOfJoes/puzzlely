import type { Response } from "@/types/api";
import type { UserStats } from "@/types/user";

import APIError from "./error";

/**
 * Fetches user stats. Will be called in client side
 */
async function findUserStats(userID: string): Promise<UserStats> {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users/stats/${userID}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const json: Response<UserStats> = await request.json();
  // TODO: Capture error
  if (!json.success || !json.payload) {
    const { error } = json;
    throw new APIError(error?.code, error?.message);
  }

  return json.payload;
}

export default findUserStats;
