import { useMemo } from "react";

import { useFetcher, useNavigation } from "@remix-run/react";
import dayjs from "dayjs";

import { Grid, GridBlock, GridBlocks, GridGroup, GridMenu } from "@/components/grid";
import { useGameContext } from "@/hooks/use-game";
import type { PuzzleLike } from "@/types/puzzle-like";
import type { Response } from "@/types/response";

export function IndexGrid() {
	const [state, actions] = useGameContext();

	const fetcher = useFetcher<Response<PuzzleLike>>({
		key: "puzzles.like.$id",
	});
	const navigation = useNavigation();

	const isLoading = navigation.location?.pathname === "/" && navigation.state === "loading";

	const likedAt = useMemo<Date | null | undefined>(() => {
		if (!fetcher.data) {
			return state.game.puzzle.liked_at;
		}

		switch (fetcher.state) {
			case "idle":
				if (!fetcher.data || !fetcher.data.success) {
					return state.game.puzzle.liked_at;
				}

				return fetcher.data.data.active ? undefined : dayjs(fetcher.data.data.updatedAt).toDate();

			default:
				return state.game.puzzle.liked_at;
		}
	}, [fetcher.data, fetcher.state, state.game.puzzle.liked_at]);
	const numOfLikes = useMemo<number>(() => {
		if (!fetcher.data || !!likedAt === !!state.game.puzzle.liked_at) {
			return state.game.puzzle.num_of_likes;
		}

		return likedAt ? state.game.puzzle.num_of_likes + 1 : state.game.puzzle.num_of_likes - 1;
	}, [fetcher.data, state.game.puzzle.liked_at, state.game.puzzle.num_of_likes, likedAt]);

	return (
		<Grid>
			{(isLoading || state.blocks.length === 0) && (
				<GridBlocks>
					{Array.from({ length: 16 }).map((_, i) => (
						<GridBlock
							className="animate-pulse"
							disabled
							hasCorrect={false}
							isError={false}
							isSelected={false}
							key={`GridBlock-skeleton-${i + 1}`}
						/>
					))}
				</GridBlocks>
			)}

			{!isLoading && state.blocks.length > 0 && (
				<GridBlocks>
					{state.game.correct.map((group_id) => {
						const group = state.game.puzzle.groups.find((g) => g.id === group_id);
						if (!group) {
							return null;
						}

						return <GridGroup key={group.id}>{group.description}</GridGroup>;
					})}

					{state.blocks.map((block) => {
						const isCorrect = state.game.correct.includes(block.puzzle_group_id);
						const isSelected = state.selected.findIndex((b) => b.id === block.id) !== -1;

						if (isCorrect) {
							return null;
						}

						return (
							<GridBlock
								disabled={state.isGameOver || state.isWinnerWinnerChickenDinner}
								hasCorrect={state.game.correct.length > 0}
								isError={isSelected && state.isWrong}
								isSelected={isSelected && !state.isWrong}
								key={`${block.puzzle_group_id}-${block.value}`}
								onClick={() => actions.onBlockSelect(block)}
							>
								{block.value}
							</GridBlock>
						);
					})}
				</GridBlocks>
			)}

			{!isLoading && (state.isGameOver || state.isWinnerWinnerChickenDinner) && (
				<GridMenu
					blocks={state.blocks}
					game={{
						...state.game,
						puzzle: {
							...state.game.puzzle,

							liked_at: likedAt,
							num_of_likes: numOfLikes,
						},
					}}
					isSuccess={state.isWinnerWinnerChickenDinner}
				/>
			)}
		</Grid>
	);
}
