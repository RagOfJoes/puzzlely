import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/cn";

export const Skeleton = forwardRef<
	ElementRef<typeof Primitive.div>,
	ComponentPropsWithoutRef<typeof Primitive.div>
>(({ asChild, className, ...props }, ref) => {
	const C = asChild ? Slot : "div";

	return (
		<C
			{...props}
			className={cn(
				"animate-pulse bg-muted",

				"after:invisible",
				"before:invisible",

				className,
			)}
			ref={ref}
		/>
	);
});
Skeleton.displayName = "Skeleton";
