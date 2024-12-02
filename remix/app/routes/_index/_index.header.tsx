import { useFetcher, useNavigation } from "@remix-run/react";
import { FlagIcon, HeartIcon, ShuffleIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { useGameContext } from "@/hooks/use-game";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { abbreviateNumber } from "@/lib/abbreviate-number";
import { cn } from "@/lib/cn";
import type { PuzzleLike } from "@/types/puzzle-like";

export function IndexHeader() {
	const [state, actions] = useGameContext();

	const fetcher = useFetcher<PuzzleLike>({
		key: `puzzles.like.${state.game.puzzle.id}`,
	});
	const navigation = useNavigation();

	const isLoading = navigation.location?.pathname === "/" && navigation.state === "loading";

	const optimisticLike = usePuzzleOptimisticLike(fetcher, state.game.puzzle);

	return (
		<div
			className={cn(
				"grid w-full grid-cols-4 gap-1",

				"data-[is-game-over='true']:opacity-50",
				"data-[is-loading='true']:animate-pulse",
			)}
			data-is-game-over={state.isGameOver || state.isWinnerWinnerChickenDinner}
			data-is-loading={isLoading}
		>
			<div
				className={cn(
					"col-span-1",

					"max-md:col-span-2 max-md:row-start-1",
					"md:col-start-1",
				)}
			>
				<div className="flex h-full w-full items-center justify-between border bg-background px-4 py-2">
					<div className="flex h-full flex-col items-start justify-end">
						<h3 className="text-sm font-medium tracking-tight">Attempts Left</h3>

						<div className="mt-2 text-2xl font-bold leading-none">
							{isLoading ? (
								<Skeleton>
									<span className="invisible">10</span>
								</Skeleton>
							) : (
								state.game.puzzle.max_attempts - state.wrongAttempts
							)}
						</div>

						<div className="text-xs text-muted-foreground">
							{isLoading ? (
								<Skeleton>
									<span className="invisible">out of 10</span>
								</Skeleton>
							) : (
								`out of ${state.game.puzzle.max_attempts}`
							)}
						</div>
					</div>

					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
						<HeartIcon className="h-4 w-4 fill-current" />
					</div>
				</div>
			</div>

			<div
				className={cn(
					"col-span-1 flex h-full w-full flex-col gap-1",

					"max-md:col-span-4 max-md:h-auto max-md:flex-row",
				)}
			>
				<Button
					aria-label="Give up"
					className={cn(
						"h-full w-full gap-2",

						"disabled:opacity-100",
						"max-md:h-11 max-md:basis-1/2",
					)}
					data-is-loading={isLoading}
					disabled={isLoading || state.isGameOver || state.isWinnerWinnerChickenDinner}
					onClick={actions.onGiveUp}
					variant="outline"
				>
					<FlagIcon className="h-3 w-3" />

					<span>Give up</span>

					<kbd className="pointer-events-none whitespace-nowrap rounded border border-b-[3px] px-1.5 font-mono text-[0.8em] font-bold leading-normal text-inherit">
						[
					</kbd>
				</Button>

				<Button
					aria-label="Shuffle"
					className={cn(
						"h-full w-full gap-2",

						"disabled:opacity-100",
						"max-md:h-11 max-md:basis-1/2",
					)}
					data-is-loading={isLoading}
					disabled={isLoading || state.isGameOver || state.isWinnerWinnerChickenDinner}
					onClick={actions.onShuffle}
					variant="outline"
				>
					<ShuffleIcon className="h-3 w-3" />

					<span>Shuffle</span>

					<kbd className="pointer-events-none whitespace-nowrap rounded border border-b-[3px] px-1.5 font-mono text-[0.8em] font-bold leading-normal text-inherit">
						]
					</kbd>
				</Button>
			</div>

			<div
				className={cn(
					"col-span-1",

					"max-md:col-span-2 max-md:col-start-3 max-md:row-start-1",
					"md:col-start-4",
				)}
			>
				<div className="flex h-full w-full items-center justify-between border bg-background px-4 py-2">
					<div className="flex flex-col items-start justify-end">
						<h3 className="text-sm font-medium tracking-tight">Likes</h3>

						<div className="mt-2 line-clamp-2 text-2xl font-bold leading-none">
							{isLoading ? (
								<Skeleton>
									<span className="invisible">10</span>
								</Skeleton>
							) : (
								abbreviateNumber(optimisticLike.num_of_likes)
							)}
						</div>
					</div>

					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
						<StarIcon className="h-4 w-4 fill-current" />
					</div>
				</div>
			</div>
		</div>
	);
}
