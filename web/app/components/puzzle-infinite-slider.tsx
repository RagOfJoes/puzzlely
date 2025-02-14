import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { cn } from "@/lib/cn";

export type PuzzleInfiniteSliderProps = Omit<
	ComponentPropsWithoutRef<typeof Primitive.div>,
	"children"
>;

export const PuzzleInfiniteSlider = forwardRef<
	ElementRef<typeof Primitive.div>,
	PuzzleInfiniteSliderProps
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
				key={`PuzzleInfiniteSlider-${i}`}
			>
				{Array.from({ length: 4 }).map((__, j) => (
					<li
						className={cn(
							"grid select-none grid-cols-4 gap-0.5",

							"first:ml-8",
						)}
						key={`PuzzleInfiniteSlider-${i}-Slide-${j}`}
					>
						<div className="col-span-4 grid grid-cols-4 gap-0.5">
							<div className="h-6 w-full rounded-xl border bg-card" />

							<div className="grid h-6 grid-cols-1 gap-0.5">
								<div className="w-full rounded-xl border bg-card" />
								<div className="w-full rounded-xl border bg-card" />
							</div>

							<div className="col-start-4 h-6 w-full rounded-xl border bg-card" />
						</div>

						{Array.from({ length: 16 }).map((___, k) => (
							<div
								className="h-10 w-10 rounded-xl border bg-card"
								key={`PuzzleInfiniteSlider-${i}-Slide-${j}-${k}`}
							/>
						))}

						<div className="col-span-4 grid grid-cols-4 gap-0.5">
							<div className="col-start-3 h-4 w-full rounded-xl border bg-card" />
							<div className="h-4 w-full rounded-xl border bg-card" />
						</div>
					</li>
				))}
			</ul>
		))}
	</Primitive.div>
));
PuzzleInfiniteSlider.displayName = "PuzzleInfiniteSlider";
