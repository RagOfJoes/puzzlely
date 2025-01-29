import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/cn";

export const ScrollAreaScrollbar = forwardRef<
	ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
	ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
	<ScrollAreaPrimitive.ScrollAreaScrollbar
		{...props}
		className={cn(
			"flex touch-none select-none transition-opacity",

			"data-[state=hidden]:opacity-0",
			"data-[state=visible]:opacity-100",

			orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
			orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",

			className,
		)}
		forceMount
		orientation={orientation}
		ref={ref}
	>
		<ScrollAreaPrimitive.ScrollAreaThumb className="relative z-50 flex-1 rounded-full bg-foreground/20" />
	</ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollAreaScrollbar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export const ScrollArea = forwardRef<
	ElementRef<typeof ScrollAreaPrimitive.Root>,
	ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, scrollHideDelay = 125, ...props }, ref) => (
	<ScrollAreaPrimitive.Root
		{...props}
		className={cn(
			"relative overflow-hidden",

			className,
		)}
		ref={ref}
		scrollHideDelay={scrollHideDelay}
	>
		<ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
			{children}
		</ScrollAreaPrimitive.Viewport>

		<ScrollAreaScrollbar />

		<ScrollAreaPrimitive.Corner />
	</ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
