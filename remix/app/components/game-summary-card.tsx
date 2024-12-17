import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { ChartNoAxesCombinedIcon, PlayIcon, StarIcon } from "lucide-react";
import { Link, useFetcher } from "react-router";

import { Button } from "@/components/button";
import { abbreviateNumber } from "@/lib/abbreviate-number";
import { cn } from "@/lib/cn";
import type { GameSummary } from "@/types/game-summary";
import type { PuzzleLike } from "@/types/puzzle-like";
import type { Response } from "@/types/response";

export type GameSummaryCardProps = Omit<
	ComponentPropsWithoutRef<typeof Primitive.div>,
	"children"
> & {
	game: GameSummary;
};

export const GameSummaryCard = forwardRef<ElementRef<typeof Primitive.div>, GameSummaryCardProps>(
	({ className, game, ...props }, ref) => {
		const fetcher = useFetcher<Response<PuzzleLike>>({
			key: `puzzles.like.${game.puzzle.id}`,
		});

		return (
			<Primitive.div
				{...props}
				className={cn(
					"h-full w-full rounded-xl border bg-card p-4",

					className,
				)}
				ref={ref}
			>
				<div className="flex justify-between gap-2">
					<div className="flex w-full min-w-0 items-center gap-2">
						<div
							aria-label={`${game.puzzle.difficulty} difficulty`}
							className={cn(
								"inline-flex min-w-0 shrink-0 items-center px-1 py-0.5",

								"data-[difficulty='EASY']:bg-success data-[difficulty='EASY']:text-success-foreground",
								"data-[difficulty='HARD']:bg-destructive data-[difficulty='HARD']:text-destructive-foreground",
								"data-[difficulty='MEDIUM']:bg-warning data-[difficulty='MEDIUM']:text-warning-foreground",
							)}
							data-difficulty={game.puzzle.difficulty}
						>
							<p className="w-full truncate text-sm font-semibold">{game.puzzle.difficulty}</p>
						</div>

						<Link
							className={cn(
								"min-w-0 no-underline outline-none ring-offset-background transition-all",

								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
							)}
							to={`/users/${game.puzzle.created_by.id}`}
						>
							<p className="truncate font-medium">{game.puzzle.created_by.username}</p>
						</Link>
					</div>

					<fetcher.Form action={`/puzzles/like/${game.puzzle.id}`} method="PUT">
						<Button
							aria-label={game.puzzle.liked_at ? "Unlike puzzle" : "Like puzzle"}
							className={cn(
								"min-w-0 shrink-0 gap-2 text-muted-foreground",

								"[&>svg]:data-[is-liked=true]:fill-current",
							)}
							data-is-liked={!!game.puzzle.liked_at}
							size="sm"
							variant="outline"
						>
							<StarIcon className="h-4 w-4" />

							<span>{game.puzzle.liked_at ? "Liked" : "Like"}</span>

							<hr className="h-full w-[1px] bg-border" />

							<span>{abbreviateNumber(game.puzzle.num_of_likes)}</span>
						</Button>
					</fetcher.Form>
				</div>

				<div className="mt-1 flex w-full items-center justify-between gap-2">
					<p className="line-clamp-1 w-full text-ellipsis text-xs font-medium uppercase text-muted-foreground">
						{game.puzzle.max_attempts} attempts
					</p>
				</div>

				<div className="mt-4 inline-flex min-w-0 items-center gap-2">
					<span className="group relative flex h-2 w-2" data-is-complete={!!game.completed_at}>
						<span
							className={cn(
								"absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75",

								"group-data-[is-complete=false]:bg-warning",
								"group-data-[is-complete=true]:bg-success",
							)}
						/>
						<span
							className={cn(
								"relative inline-flex h-2 w-2 rounded-full bg-warning",

								"group-data-[is-complete=false]:bg-warning",
								"group-data-[is-complete=true]:bg-success",
							)}
						/>
					</span>

					<p className="text-sm font-medium text-muted-foreground">
						{game.completed_at ? "Completed" : "In Progress"}
					</p>
				</div>

				<div className="mt-4 grid w-full grid-cols-2">
					<p className="col-span-1 flex items-center text-sm text-muted-foreground">Score</p>
					<p className="col-span-1 text-end  text-sm text-foreground">
						{game.score} / <small className="text-xs text-muted-foreground">4</small>
					</p>

					<p className="col-span-1 flex items-center text-sm text-muted-foreground">Attempts</p>
					<p className="col-span-1 text-end text-sm text-foreground">
						{game.attempts} /{" "}
						<small className="text-xs text-muted-foreground">{game.puzzle.max_attempts}</small>
					</p>
				</div>

				<div className="mt-4 flex w-full items-center justify-between gap-2">
					<Button
						aria-label="View statistics"
						className="gap-2 text-muted-foreground"
						size="sm"
						variant="link"
					>
						<ChartNoAxesCombinedIcon className="h-4 w-4" />
						Stats
					</Button>

					<Link
						className="h-full"
						rel="nofollow"
						tabIndex={-1}
						to={`/puzzles/play/${game.puzzle.id}/`}
					>
						<Button aria-label="Play puzzle" className="gap-2" size="sm">
							Play
							<PlayIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</Primitive.div>
		);
	},
);
GameSummaryCard.displayName = "GameSummaryCard";
