import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { ChartNoAxesCombinedIcon, EditIcon, PlayIcon, StarIcon } from "lucide-react";
import { Link, useFetcher } from "react-router";

import { Button } from "@/components/button";
import { DateTime } from "@/components/date-time";
import { usePuzzleSummaryOptimisticLike } from "@/hooks/use-puzzle-summary-optimistic-like";
import { abbreviateNumber } from "@/lib/abbreviate-number";
import { cn } from "@/lib/cn";
import type { PuzzleLike } from "@/types/puzzle-like";
import type { PuzzleSummary } from "@/types/puzzle-summary";
import type { Response } from "@/types/response";

export type PuzzleSummaryCardProps = Omit<
	ComponentPropsWithoutRef<typeof Primitive.div>,
	"children"
> & {
	isEditable?: boolean;
	puzzle: PuzzleSummary;
};

export const PuzzleSummaryCard = forwardRef<
	ElementRef<typeof Primitive.div>,
	PuzzleSummaryCardProps
>(({ className, isEditable, puzzle, ...props }, ref) => {
	const fetcher = useFetcher<Response<PuzzleLike>>({
		key: `puzzles.like.${puzzle.id}`,
	});
	const optimisticLike = usePuzzleSummaryOptimisticLike(fetcher, puzzle);

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
						aria-label={`${puzzle.difficulty} difficulty`}
						className={cn(
							"inline-flex min-w-0 shrink-0 items-center px-1 py-0.5",

							"data-[difficulty='EASY']:bg-success data-[difficulty='EASY']:text-success-foreground",
							"data-[difficulty='HARD']:bg-destructive data-[difficulty='HARD']:text-destructive-foreground",
							"data-[difficulty='MEDIUM']:bg-warning data-[difficulty='MEDIUM']:text-warning-foreground",
						)}
						data-difficulty={puzzle.difficulty}
					>
						<p className="w-full truncate text-sm font-semibold">{puzzle.difficulty}</p>
					</div>

					<Link
						className={cn(
							"min-w-0 no-underline outline-none ring-offset-background transition-all",

							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						)}
						to={`/users/${puzzle.created_by.id}/`}
					>
						<p className="truncate font-medium">{puzzle.created_by.username}</p>
					</Link>
				</div>

				<fetcher.Form action={`/puzzles/like/${puzzle.id}`} method="PUT">
					<Button
						aria-label={optimisticLike.me_liked_at ? "Unlike puzzle" : "Like puzzle"}
						className={cn(
							"min-w-0 shrink-0 gap-2 text-muted-foreground",

							"[&>svg]:data-[is-liked=true]:fill-current",
						)}
						data-is-liked={!!optimisticLike.me_liked_at}
						size="sm"
						variant="outline"
					>
						<StarIcon className="h-4 w-4" />

						<span>{optimisticLike.me_liked_at ? "Liked" : "Like"}</span>

						<hr className="h-full w-[1px] bg-border" />

						<span>{abbreviateNumber(optimisticLike.num_of_likes)}</span>
					</Button>
				</fetcher.Form>
			</div>

			<div className="mt-1 flex w-full items-center justify-between gap-2">
				<p className="line-clamp-1 w-full text-ellipsis text-xs font-medium uppercase text-muted-foreground">
					{puzzle.max_attempts} attempts
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

				<div className="flex gap-2">
					{isEditable && (
						<Link
							className="h-full"
							rel="nofollow"
							tabIndex={-1}
							to={`/puzzles/edit/${puzzle.id}/`}
						>
							<Button
								aria-label="Edit puzzle"
								className="h-9 w-9 text-muted-foreground"
								size="icon"
								variant="ghost"
							>
								<EditIcon className="h-4 w-4" />
							</Button>
						</Link>
					)}

					<Link className="h-full" rel="nofollow" tabIndex={-1} to={`/puzzles/play/${puzzle.id}/`}>
						<Button aria-label="Play puzzle" className="gap-2" size="sm">
							Play
							<PlayIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			<DateTime
				className="mt-4 line-clamp-1 w-full text-ellipsis text-xs font-medium text-muted-foreground"
				dateTime={puzzle.created_at}
				format="MMM DD, YYYY"
			/>
		</Primitive.div>
	);
});
PuzzleSummaryCard.displayName = "PuzzleSummaryCard";
