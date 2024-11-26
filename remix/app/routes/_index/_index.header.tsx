import { useNavigation } from "@remix-run/react";
import { FlagIcon, HeartIcon, ShuffleIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/button";
import { Skeleton } from "@/components/skeleton";
import { useGameContext } from "@/hooks/use-game";
import { abbreviateNumber } from "@/lib/abbreviate-number";
import { cn } from "@/lib/cn";

export function IndexHeader() {
	const [state, actions] = useGameContext();

	const navigation = useNavigation();

	const isLoading = navigation.location?.pathname === "/" && navigation.state === "loading";

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
				<div className="flex h-full w-full items-center justify-between border bg-muted px-4 py-2">
					<div className="flex h-full flex-col items-start justify-end">
						<h3 className="text-sm font-medium tracking-tight">Attempts Left</h3>

						<div className="mt-2 text-2xl font-bold leading-none">
							{isLoading ? (
								<Skeleton className="bg-foreground/10 text-transparent">10</Skeleton>
							) : (
								state.game.puzzle.max_attempts - state.wrongAttempts
							)}
						</div>

						<div className="text-xs text-muted-foreground">
							{isLoading ? (
								<Skeleton className="bg-foreground/10 text-transparent">out of 10</Skeleton>
							) : (
								`out of ${state.game.puzzle.max_attempts}`
							)}
						</div>
					</div>

					<div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary">
						<HeartIcon className="h-4 w-4" />
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
					<div>Give up</div>

					<kbd className="pointer-events-none whitespace-nowrap rounded border border-b-[3px] border-primary/40 bg-primary/10 px-1.5 font-mono text-[0.8em] font-bold leading-normal text-primary">
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

					<div>Shuffle</div>

					<kbd className="pointer-events-none whitespace-nowrap rounded border border-b-[3px] border-primary/40 bg-primary/10 px-1.5 font-mono text-[0.8em] font-bold leading-normal text-primary">
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
				<div className="flex h-full w-full items-center justify-between border bg-muted px-4 py-2">
					<div className="flex flex-col items-start justify-end">
						<h3 className="text-sm font-medium tracking-tight">Likes</h3>

						<div className="mt-2 line-clamp-2 text-2xl font-bold leading-none">
							{isLoading ? (
								<Skeleton className="bg-foreground/10 text-transparent">10</Skeleton>
							) : (
								abbreviateNumber(state.game.puzzle.num_of_likes)
							)}
						</div>
					</div>

					<div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary">
						<StarIcon className="h-4 w-4" />
					</div>
				</div>
			</div>
		</div>
	);
}
