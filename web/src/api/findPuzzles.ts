import type { Response } from "@/types/api";
import type { PuzzleConnection, PuzzleFilters } from "@/types/puzzle";

import APIError from "./error";

/**
 * Fetches puzzles. Will be called in client side
 */
async function findPuzzles(
  params: { cursor?: string; limit: number },
  filters: {
    [key in PuzzleFilters]?: string;
  }
): Promise<PuzzleConnection> {
  const { limit, cursor } = params;

  const filterArray = [];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { customizable_attempts, customizable_time, difficulty, num_of_likes } =
    filters;
  if (customizable_attempts === "true" || customizable_attempts === "false") {
    filterArray.push(`customizable_attempts=${customizable_attempts}`);
  }
  if (customizable_time === "true" || customizable_time === "false") {
    filterArray.push(`customizable_time=${customizable_time}`);
  }
  switch (difficulty) {
    case "Easy":
    case "Medium":
    case "Hard":
      filterArray.push(`difficulty=${difficulty}`);
      break;
    default:
      break;
  }
  if (num_of_likes) {
    filterArray.push(`num_of_likes=${num_of_likes}`);
  }

  const cursorQuery = cursor ? `&cursor=${cursor}` : "";
  const filterQuery = filterArray.length > 0 ? `&${filterArray.join("&")}` : "";
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/puzzles/recent?limit=${limit}${cursorQuery}${filterQuery}`,
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

export default findPuzzles;
