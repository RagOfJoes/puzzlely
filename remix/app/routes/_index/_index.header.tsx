import { FlagIcon, HeartIcon, ShuffleIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/button";
import { useGameContext } from "@/hooks/use-game";
import { cn } from "@/lib/cn";

export function IndexHeader() {
	const [state, actions] = useGameContext();

	return (
		<div className="grid w-full grid-cols-4 gap-1 transition-opacity">
			<div
				className={cn(
					"col-span-1",

					"data-[is-game-over='true']:opacity-50",
					"max-md:col-span-2 max-md:row-start-1",
					"md:col-start-1",
				)}
				data-is-game-over={state.isGameOver || state.isWinnerWinnerChickenDinner}
			>
				<div className="flex w-full items-center justify-between border bg-muted px-4 py-2">
					<div className="flex flex-col items-start justify-end">
						<h3 className="text-sm font-medium tracking-tight">Attempts Left</h3>

						<div className="mt-2 text-2xl font-bold leading-none">
							{state.game.puzzle.max_attempts - state.wrongAttempts}
						</div>

						<div className="text-xs text-muted-foreground">
							out of {state.game.puzzle.max_attempts}
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

						"max-md:h-11 max-md:basis-1/2",
					)}
					disabled={state.isGameOver || state.isWinnerWinnerChickenDinner}
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

						"max-md:h-11 max-md:basis-1/2",
					)}
					disabled={state.isGameOver || state.isWinnerWinnerChickenDinner}
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

					"data-[is-game-over='true']:opacity-50",
					"max-md:col-span-2 max-md:col-start-3 max-md:row-start-1",
					"md:col-start-4",
				)}
				data-is-game-over={state.isGameOver || state.isWinnerWinnerChickenDinner}
			>
				<div className="flex h-full w-full items-center justify-between border bg-muted px-4 py-2">
					<div className="flex flex-col items-start justify-end">
						<h3 className="text-sm font-medium tracking-tight">Likes</h3>

						<div className="line-clamp-2 text-lg font-bold leading-none">
							{state.game.puzzle.num_of_likes}
						</div>
					</div>

					<Button
						className={cn(
							"border border-primary bg-primary/10 text-primary",

							"data-[is-liked=true]:text-primary",
							"hover:enabled:bg-primary/20",
							"[&>svg]:data-[is-liked=true]:fill-current",
						)}
						data-is-liked={!!state.game.puzzle.liked_at}
						size="icon"
					>
						<StarIcon className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
