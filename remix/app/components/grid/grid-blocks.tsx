import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { Children, forwardRef, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { cn } from "@/lib/cn";

export type GridBlocksProps = ComponentPropsWithoutRef<typeof Primitive.div>;

export const GridBlocks = forwardRef<ElementRef<typeof Primitive.div>, GridBlocksProps>(
	(props, ref) => {
		const children = useMemo(
			() =>
				Children.toArray(props.children).filter(
					(child: any) =>
						child?.type?.displayName === "GridBlock" || child?.type?.displayName === "GridGroup",
				),
			[props.children],
		);

		return (
			<Primitive.div
				{...props}
				className={cn(
					"relative grid h-full w-full grid-cols-4 grid-rows-4 gap-1",

					'before:col-start-1 before:col-end-1 before:row-start-1 before:row-end-1 before:w-0 before:content-[""]',

					props.className,
				)}
				ref={ref}
			>
				{children}
			</Primitive.div>
		);
	},
);
GridBlocks.displayName = "GridBlocks";
