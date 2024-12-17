import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import { useFetcher, useNavigation } from "react-router";

import type { GridProps } from "@/components/grid";
import { Grid, GridBlock, GridBlocks, GridGroup, GridMenu } from "@/components/grid";
import { useGameContext } from "@/hooks/use-game";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { cn } from "@/lib/cn";
import type { action } from "@/routes/puzzles/like.$id";

export type GameLayoutGridProps = Omit<GridProps, "children">;

export const GameLayoutGrid = forwardRef<ElementRef<typeof Primitive.div>, GameLayoutGridProps>(
	({ className, ...props }, ref) => {
		const [state, actions] = useGameContext();

		const navigation = useNavigation();

		const fetcher = useFetcher<typeof action>({
			key: `puzzles.like.${state.puzzle.id}`,
		});

		const optimisticLike = usePuzzleOptimisticLike(fetcher, state.puzzle);

		const isLoading = navigation.location?.pathname === "/" && navigation.state === "loading";

		return (
			<Grid
				{...props}
				className={cn(
					"",

					className,
				)}
				ref={ref}
			>
				{(isLoading || state.blocks.length === 0) && (
					<GridBlocks
						className={cn(
							"",

							"[&>button:first-of-type]:data-[has-correct=false]:col-start-1 [&>button:first-of-type]:data-[has-correct=false]:col-end-1 [&>button:first-of-type]:data-[has-correct=false]:row-start-1 [&>button:first-of-type]:data-[has-correct=false]:row-end-1",
						)}
						data-has-correct={false}
					>
						{Array.from({ length: 16 }).map((_, i) => (
							<GridBlock disabled key={`GridBlock-skeleton-${i + 1}`} />
						))}
					</GridBlocks>
				)}

				{!isLoading && state.blocks.length > 0 && (
					<GridBlocks
						className={cn(
							"",

							"[&>button:first-of-type]:data-[has-correct=false]:col-start-1 [&>button:first-of-type]:data-[has-correct=false]:col-end-1 [&>button:first-of-type]:data-[has-correct=false]:row-start-1 [&>button:first-of-type]:data-[has-correct=false]:row-end-1",
						)}
						data-has-correct={state.game.correct.length > 0}
					>
						{state.game.correct.map((group_id) => {
							const group = state.puzzle.groups.find((g) => g.id === group_id);
							if (!group) {
								return null;
							}

							return (
								<GridGroup
									aria-disabled={state.isGameOver || state.isWinnerWinnerChickenDinner}
									key={group.id}
								>
									{group.description}
								</GridGroup>
							);
						})}

						{state.blocks.map((block) => {
							const isCorrect = state.game.correct.includes(block.puzzle_group_id);
							const isSelected = state.selected.findIndex((b) => b.id === block.id) !== -1;

							if (isCorrect) {
								return null;
							}

							return (
								<GridBlock
									data-error={isSelected && state.isWrong}
									data-selected={isSelected && !state.isWrong}
									disabled={state.isGameOver || state.isWinnerWinnerChickenDinner}
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
						game={state.game}
						puzzle={{
							...state.puzzle,

							liked_at: optimisticLike.liked_at,
							num_of_likes: optimisticLike.num_of_likes,
						}}
						isSuccess={state.isWinnerWinnerChickenDinner}
					/>
				)}
			</Grid>
		);
	},
);
GameLayoutGrid.displayName = "GameLayoutGrid";
