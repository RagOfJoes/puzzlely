import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { ChartNoAxesCombinedIcon, PlayIcon, StarIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type PuzzleSummaryCardInfiniteSliderProps = Omit<
	ComponentPropsWithoutRef<typeof Primitive.div>,
	"children"
>;

export const PuzzleSummaryCardInfiniteSlider = forwardRef<
	ElementRef<typeof Primitive.div>,
	PuzzleSummaryCardInfiniteSliderProps
>(({ className, ...props }, ref) => (
	<Primitive.div
		{...props}
		className={cn(
			"group flex w-full min-w-0 [mask-image:_linear-gradient(to_right,transparent_0,_#1a1825_125px,_#1a1825_calc(100%-200px),transparent_100%)]",

			className,
		)}
		ref={ref}
	>
		{Array.from({ length: 2 }).map((_, i) => (
			<ul
				aria-hidden={i > 0}
				className={cn(
					"animate-slide-left flex h-full shrink-0 items-center gap-8 will-change-transform",

					"group-focus-visible:[animation-play-state:paused]",
					"group-hover:[animation-play-state:paused]",
					"motion-reduce:[animation-play-state:paused]",
				)}
				key={`PuzzleSummaryCardInfiniteSlider-${i}`}
			>
				{Array.from({ length: 4 }).map((__, j) => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					const difficulty = useMemo(() => {
						switch (j) {
							case 0:
								return "EASY";
							case 1:
								return "MEDIUM";
							default:
								return "HARD";
						}
					}, [j]);

					return (
						<li
							className={cn(
								"w-[325px] select-none rounded-xl border bg-card p-4",

								"first:ml-8",
							)}
							key={`PuzzleSummaryCardInfiniteSlider-${i}-Slide-${j}`}
						>
							<div className="flex justify-between gap-2">
								<div className="flex w-full min-w-0 items-center gap-2">
									<div
										className={cn(
											"inline-flex min-w-0 shrink-0 items-center px-1 py-0.5",

											"data-[difficulty='EASY']:bg-success",
											"data-[difficulty='HARD']:bg-destructive",
											"data-[difficulty='MEDIUM']:bg-warning",
										)}
										data-difficulty={difficulty}
									>
										<p className="invisible w-full select-none truncate text-sm font-semibold">
											HARD
										</p>
									</div>

									<div className="rounded-xl bg-muted">
										<p className="invisible select-none truncate text-xs font-medium">Puzzlely</p>
									</div>
								</div>

								<div className="flex min-w-0 shrink-0 items-center gap-2 bg-muted px-1 py-0.5">
									<StarIcon className="invisible h-4 w-4 shrink-0" />

									<hr className="h-full w-[1px] bg-border" />

									<p className="invisible w-full select-none truncate font-semibold">10</p>
								</div>
							</div>

							<div className="mt-1 inline-block min-w-0 rounded-xl bg-muted">
								<p className="invisible select-none truncate text-xs font-medium">6 Attempts</p>
							</div>

							<div className="mt-4 flex w-full items-center justify-between gap-2">
								<div className="flex min-w-0 shrink-0 items-center gap-2 bg-muted px-1 py-0.5">
									<ChartNoAxesCombinedIcon className="h-4 w-4 shrink-0 text-transparent" />

									<p className="invisible w-full select-none truncate font-semibold">Stats</p>
								</div>

								<div className="flex min-w-0 shrink-0 items-center gap-2 bg-muted px-1 py-0.5 text-transparent">
									<p className="invisible w-full select-none truncate font-semibold">Play</p>

									<PlayIcon className="h-4 w-4 shrink-0 text-transparent" />
								</div>
							</div>

							<div className="mt-4 inline-block min-w-0 rounded-xl bg-muted">
								<p className="invisible select-none truncate text-xs font-medium">Feb 13, 2000</p>
							</div>
						</li>
					);
				})}
			</ul>
		))}
	</Primitive.div>
));
PuzzleSummaryCardInfiniteSlider.displayName = "PuzzleSummaryCardInfiniteSlider";
