import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { Link, useFetcher } from "@remix-run/react";
import dayjs from "dayjs";
import { ChartNoAxesCombinedIcon, EditIcon, PlayIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/button";
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

	return (
		<Primitive.div
			{...props}
			className={cn(
				"h-full w-full border bg-background p-4",

				className,
			)}
			ref={ref}
		>
			<div className="flex justify-between gap-2">
				<div className="flex w-full min-w-0 items-center gap-2">
					<div
						aria-label={`${puzzle.difficulty} difficulty`}
						className={cn(
							"inline-flex min-w-0 shrink-0 items-center px-2 py-1",

							"data-[difficulty='EASY']:bg-secondary data-[difficulty='EASY']:text-secondary-foreground",
							"data-[difficulty='HARD']:bg-destructive data-[difficulty='HARD']:text-destructive-foreground",
							"data-[difficulty='MEDIUM']:bg-primary data-[difficulty='MEDIUM']:text-primary-foreground",
						)}
						data-difficulty={puzzle.difficulty}
					>
						<p className="w-full truncate text-sm font-semibold leading-none text-current">
							{puzzle.difficulty}
						</p>
					</div>

					<Link
						className={cn(
							"min-w-0 no-underline outline-none ring-offset-background transition-all",

							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						)}
						to={`/users/${puzzle.created_by.id}`}
					>
						<p className="truncate font-semibold leading-none">{puzzle.created_by.username}</p>
					</Link>
				</div>

				<fetcher.Form action={`/puzzles/like/${puzzle.id}`} method="PUT">
					<Button
						aria-label={puzzle.liked_at ? "Unlike puzzle" : "Like puzzle"}
						className={cn(
							"min-w-0 shrink-0 gap-2 text-muted-foreground",

							"[&>svg]:data-[is-liked=true]:fill-current",
						)}
						data-is-liked={!!puzzle.liked_at}
						size="sm"
						variant="outline"
					>
						<StarIcon className="h-4 w-4" />

						<span>{puzzle.liked_at ? "Liked" : "Like"}</span>

						<hr className="h-full w-[1px] bg-border" />

						<span>{abbreviateNumber(puzzle.num_of_likes)}</span>
					</Button>
				</fetcher.Form>
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
						<Link className="h-full" rel="nofollow" tabIndex={-1} to={`/puzzles/edit/${puzzle.id}`}>
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

					<Link className="h-full" rel="nofollow" tabIndex={-1} to={`/puzzles/play/${puzzle.id}`}>
						<Button aria-label="Play puzzle" className="gap-2" size="sm">
							Play
							<PlayIcon className="h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>

			<time
				dateTime={dayjs(puzzle.created_at).toISOString()}
				className="mt-4 line-clamp-1 w-full text-ellipsis text-xs tracking-wide text-muted-foreground"
			>
				{dayjs(puzzle.created_at).format("MMM DD, YYYY")}
			</time>
		</Primitive.div>
	);
});
PuzzleSummaryCard.displayName = "PuzzleSummaryCard";
