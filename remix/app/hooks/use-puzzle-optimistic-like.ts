import { useMemo } from "react";

import dayjs from "dayjs";
import type { Fetcher } from "react-router";

import type { Puzzle } from "@/types/puzzle";
import type { PuzzleLike } from "@/types/puzzle-like";
import type { PuzzleSummary } from "@/types/puzzle-summary";
import type { Response } from "@/types/response";

export function usePuzzleOptimisticLike(
	fetcher: Fetcher<Response<PuzzleLike>>,
	puzzle: Puzzle | PuzzleSummary,
): {
	liked_at: Date | null | undefined;
	num_of_likes: number;
} {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const liked_at = useMemo<Date | null | undefined>(() => {
		if (!fetcher.data || !fetcher.data.success) {
			return puzzle.liked_at;
		}

		switch (fetcher.state) {
			case "idle":
				return !fetcher.data.data.active ? undefined : dayjs(fetcher.data.data.updatedAt).toDate();

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
