import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { FlagIcon, HeartIcon, ShuffleIcon, StarIcon } from "lucide-react";
import { useFetcher, useLocation, useNavigation } from "react-router";

import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { useGameContext } from "@/hooks/use-game";
import { usePuzzleOptimisticLike } from "@/hooks/use-puzzle-optimistic-like";
import { abbreviateNumber } from "@/lib/abbreviate-number";
import { cn } from "@/lib/cn";
import type { action } from "@/routes/puzzles/like.$id";

export type GameLayoutHeaderProps = Omit<
	ComponentPropsWithoutRef<typeof Primitive.div>,
	"children"
>;

export const GameLayoutHeader = forwardRef<ElementRef<typeof Primitive.div>, GameLayoutHeaderProps>(
	({ className, ...props }, ref) => {
		const [state, actions] = useGameContext();

		const location = useLocation();
		const navigation = useNavigation();

		const fetcher = useFetcher<typeof action>({
			key: `puzzles.like.${state.puzzle.id}`,
		});

		const optimisticLike = usePuzzleOptimisticLike(fetcher, state.puzzle);

		const isLoading =
			state.isLoading ||
			(navigation.state === "loading" && navigation.location?.pathname === location.pathname);

		return (
			<Primitive.div
				{...props}
				className={cn(
					"group grid w-full grid-cols-4 gap-1",

					className,
				)}
				data-is-game-over={state.isGameOver || state.isWinnerWinnerChickenDinner}
				ref={ref}
			>
				<div
					className={cn(
						"col-span-1",

						"max-md:col-span-2 max-md:row-start-1",
						"md:col-start-1",
					)}
				>
					<div
						className={cn(
							"flex h-full w-full items-center justify-between rounded-xl border bg-card px-4 py-2",

							"group-data-[is-game-over=true]:opacity-50",
						)}
					>
						<div className="flex h-full flex-col items-start justify-end">
							<h3 className="text-sm font-medium tracking-tight">Attempts Left</h3>

							<div className="text-2xl font-semibold">
								{isLoading ? (
									<Skeleton>
										<span className="invisible">10</span>
									</Skeleton>
								) : (
									state.puzzle.max_attempts - state.wrongAttempts
								)}
							</div>

							<div className="text-xs text-muted-foreground">
								{isLoading ? (
									<Skeleton>
										<span className="invisible">out of 10</span>
									</Skeleton>
								) : (
									`out of ${state.puzzle.max_attempts}`
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
							"h-full w-full gap-2 rounded-xl border bg-card",

							"max-md:h-11 max-md:basis-1/2",
						)}
						disabled={isLoading || state.isGameOver || state.isWinnerWinnerChickenDinner}
						onClick={actions.onGiveUp}
						variant="ghost"
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
							"h-full w-full gap-2 rounded-xl border bg-card",

							"max-md:h-11 max-md:basis-1/2",
						)}
						disabled={isLoading || state.isGameOver || state.isWinnerWinnerChickenDinner}
						onClick={actions.onShuffle}
						variant="ghost"
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
					<div
						className={cn(
							"flex h-full w-full items-center justify-between rounded-xl border bg-card px-4 py-2",

							"group-data-[is-game-over=true]:opacity-50",
						)}
					>
						<div className="flex flex-col items-start justify-end">
							<h3 className="text-sm font-medium tracking-tight">Likes</h3>

							<div className="line-clamp-2 text-2xl font-semibold">
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
			</Primitive.div>
		);
	},
);
