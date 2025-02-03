import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { cn } from "@/lib/cn";

export type GridGroupProps = ComponentPropsWithoutRef<typeof Primitive.div>;

export const GridGroup = forwardRef<ElementRef<typeof Primitive.div>, GridGroupProps>(
	(props, ref) => {
		const { children, className, ...other } = props;

		return (
			<Primitive.div
				{...other}
				className={cn(
					"col-span-4 row-span-1 inline-flex select-none items-center justify-center rounded-xl border bg-card px-4 py-2 text-foreground",

					"aria-disabled:opacity-50",
					"first-of-type:col-start-1 first-of-type:col-end-5 first-of-type:row-start-1 first-of-type:row-end-1",

					className,
				)}
				ref={ref}
			>
				<span className="line-clamp-3">{children}</span>
			</Primitive.div>
		);
	},
);
GridGroup.displayName = "GridGroup";
