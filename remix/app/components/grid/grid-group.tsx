import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { ComponentPropsWithoutRef } from "@radix-ui/react-primitive";
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
					"col-span-4 row-span-1 inline-flex select-none items-center justify-center border border-secondary bg-secondary/10 px-4 py-2 text-secondary",

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
