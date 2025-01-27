import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, useEffect, useRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { useInView } from "framer-motion";

import { useMergeRefs } from "@/hooks/use-merge-refs";

export type WaypointProps = ComponentPropsWithoutRef<typeof Primitive.div> & {
	onInView?: () => Promise<void> | void;
};

export const Waypoint = forwardRef<ElementRef<typeof Primitive.div>, WaypointProps>(
	({ onInView, ...props }, ref) => {
		const innerRef = useRef<ElementRef<typeof Primitive.div>>(null);
		const merged = useMergeRefs<ElementRef<typeof Primitive.div> | null>(innerRef, ref);

		const isInView = useInView(innerRef);

		useEffect(() => {
			if (!onInView) {
				return;
			}

			onInView();
		}, [isInView, onInView]);

		return <Primitive.div {...props} aria-hidden ref={merged} />;
	},
);
Waypoint.displayName = "Waypoint";
