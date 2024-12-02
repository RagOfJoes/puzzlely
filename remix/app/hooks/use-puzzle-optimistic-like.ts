import { useMemo } from "react";

import type { SerializeFrom } from "@remix-run/node";
import type { Fetcher } from "@remix-run/react";
import dayjs from "dayjs";

import type { Puzzle } from "@/types/puzzle";
import type { PuzzleLike } from "@/types/puzzle-like";
import type { PuzzleSummary } from "@/types/puzzle-summary";

export function usePuzzleOptimisticLike(
	fetcher: Fetcher<SerializeFrom<PuzzleLike>>,
	puzzle: Puzzle | PuzzleSummary,
): {
	liked_at: Date | null | undefined;
	num_of_likes: number;
} {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const liked_at = useMemo<Date | null | undefined>(() => {
		if (!fetcher.data) {
			return puzzle.liked_at;
		}

		switch (fetcher.state) {
			case "idle":
				return !fetcher.data.active ? undefined : dayjs(fetcher.data.updatedAt).toDate();

			default:
				return puzzle.liked_at;
		}
	}, [fetcher.data, fetcher.state, puzzle.liked_at]);

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const num_of_likes = useMemo<number>(() => {
		if (!fetcher.data || !!liked_at === !!puzzle.liked_at) {
			return puzzle.num_of_likes;
		}

		return liked_at ? puzzle.num_of_likes + 1 : puzzle.num_of_likes - 1;
	}, [fetcher.data, liked_at, puzzle.liked_at, puzzle.num_of_likes]);

	return {
		liked_at,
		num_of_likes,
	};
}
