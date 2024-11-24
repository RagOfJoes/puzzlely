import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { motion } from "framer-motion";
import type { MotionProps } from "framer-motion";

import { cn } from "@/lib/cn";

export type GridBlockProps = ComponentPropsWithoutRef<"button"> &
	MotionProps & {
		hasCorrect?: boolean;
		isError?: boolean;
		isSelected?: boolean;
	};

export const GridBlock = forwardRef<ElementRef<"button">, GridBlockProps>(
	({ children, className, disabled, hasCorrect, isError, isSelected, ...props }, ref) => (
		<motion.button
			{...props}
			className={cn(
				"col-span-1 row-span-1 inline-flex appearance-none items-center justify-center whitespace-normal border bg-muted text-sm font-medium outline-none ring-offset-background transition-[background-color,box-shadow,color] [word-break:break-word]",

				"data-[error=true]:border-destructive data-[error=true]:bg-destructive data-[error=true]:text-destructive-foreground data-[error=true]:hover:bg-destructive/90",
				"data-[has-correct=false]:first-of-type:col-start-1 data-[has-correct=false]:first-of-type:col-end-1 data-[has-correct=false]:first-of-type:row-start-1 data-[has-correct=false]:first-of-type:row-end-1",
				"data-[selected=true]:border-primary data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary data-[selected=true]:hover:bg-primary/20",
				"disabled:pointer-events-none",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"hover:enabled:bg-foreground/10",
				"motion-reduce:transition-none",

				className,
			)}
			data-error={isError}
			data-has-correct={hasCorrect}
			data-selected={isSelected}
			disabled={disabled}
			layout
			transition={{
				layout: {
					duration: 0.3,
				},
			}}
			ref={ref}
		>
			<div className="flex h-full w-full items-center justify-center p-2">
				<p
					className={cn(
						"line-clamp-4 select-none text-center font-medium leading-tight",

						"max-md:text-[0.9em]",
						"max-sm:text-[0.8em]",
					)}
				>
					{children}
				</p>
			</div>
		</motion.button>
	),
);
GridBlock.displayName = "GridBlock";
