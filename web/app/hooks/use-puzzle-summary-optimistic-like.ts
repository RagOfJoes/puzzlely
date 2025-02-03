import { useMemo } from "react";

import dayjs from "dayjs";
import type { Fetcher } from "react-router";

import type { PuzzleLike } from "@/types/puzzle-like";
import type { PuzzleSummary } from "@/types/puzzle-summary";
import type { Response } from "@/types/response";

export function usePuzzleSummaryOptimisticLike(
	fetcher: Fetcher<Response<PuzzleLike>>,
	puzzle: PuzzleSummary,
): {
	me_liked_at: Date | null | undefined;
	num_of_likes: number;
} {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const me_liked_at = useMemo<Date | null | undefined>(() => {
		if (!fetcher.data || !fetcher.data.success) {
			return puzzle.me_liked_at;
		}

		switch (fetcher.state) {
			case "idle":
				return !fetcher.data.data.active ? undefined : dayjs(fetcher.data.data.updatedAt).toDate();

			default:
				return puzzle.me_liked_at;
		}
	}, [fetcher.data, fetcher.state, puzzle.me_liked_at]);

	// eslint-disable-next-line @typescript-eslint/naming-convention
	const num_of_likes = useMemo<number>(() => {
		if (!fetcher.data || !!me_liked_at === !!puzzle.me_liked_at) {
			return puzzle.num_of_likes;
		}

		return me_liked_at ? puzzle.num_of_likes + 1 : puzzle.num_of_likes - 1;
	}, [fetcher.data, me_liked_at, puzzle.me_liked_at, puzzle.num_of_likes]);

	return {
		me_liked_at,
		num_of_likes,
	};
}
