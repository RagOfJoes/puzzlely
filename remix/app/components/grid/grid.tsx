import type { ElementRef } from "react";
import { Children, cloneElement, forwardRef, isValidElement, useMemo, useRef } from "react";

import type { ComponentPropsWithoutRef } from "@radix-ui/react-primitive";
import { Primitive } from "@radix-ui/react-primitive";

import { mergeRefs } from "@/hooks/use-merge-refs";
import { cn } from "@/lib/cn";

import type { GridBlocks } from "./grid-blocks";
import type { GridMenu } from "./grid-menu";

export type GridProps = ComponentPropsWithoutRef<typeof Primitive.div>;

export const Grid = forwardRef<ElementRef<typeof Primitive.div>, GridProps>((props, ref) => {
	const containerRef = useRef(null);

	const { blocks, menus } = useMemo(() => {
		const children: {
			blocks?: typeof GridBlocks;
			menus?: typeof GridMenu;
		} = {};

		Children.toArray(props.children).forEach((child: any) => {
			switch (child?.type?.displayName) {
				case "GridBlocks":
					children.blocks = child;
					break;
				case "GridMenu":
					children.menus = child;
					break;
				default:
					break;
			}
		});

		return children;
	}, [props.children]);

	return (
		<Primitive.div
			className={cn(
				"relative h-full",

				props.className,
			)}
			ref={mergeRefs(ref, containerRef)}
		>
			{isValidElement<typeof GridBlocks>(blocks) && cloneElement(blocks)}

			{isValidElement<typeof GridMenu>(menus) &&
				cloneElement(menus as any, {
					container: containerRef.current,
				})}
		</Primitive.div>
	);
});
Grid.displayName = "Grid";
