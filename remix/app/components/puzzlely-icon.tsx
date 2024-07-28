import { forwardRef } from "react";

import type { ComponentPropsWithoutRef, Primitive } from "@radix-ui/react-primitive";

export type PuzzlelyIconProps = ComponentPropsWithoutRef<typeof Primitive.svg>;

export const PuzzlelyIcon = forwardRef<SVGSVGElement, PuzzlelyIconProps>((props, ref) => (
	<svg viewBox="0 0 480 480" {...props} ref={ref}>
		{/* <rect rx="100" width="480" height="480" className="fill-primary" /> */}
		<path
			strokeWidth="3"
			className="fill-foreground stroke-muted"
			d="M132 337C132 325.954 140.954 317 152 317H180C191.046 317 200 325.954 200 337V351C200 369.778 184.778 385 166 385C147.222 385 132 369.778 132 351V337Z"
		/>
		<rect
			rx="20"
			x="132"
			y="243"
			width="68"
			height="68"
			strokeWidth="3"
			className="fill-foreground stroke-muted"
		/>
		<rect
			rx="20"
			x="132"
			y="169"
			width="68"
			height="68"
			strokeWidth="3"
			className="fill-foreground stroke-muted"
		/>
		<path
			strokeWidth="3"
			className="fill-foreground stroke-muted"
			d="M132 129C132 110.222 147.222 95 166 95H180C191.046 95 200 103.954 200 115V143C200 154.046 191.046 163 180 163H152C140.954 163 132 154.046 132 143V129Z"
		/>
		<rect
			y="95"
			x="206"
			rx="20"
			width="68"
			height="68"
			strokeWidth="3"
			className="fill-foreground stroke-muted"
		/>
		<path
			strokeWidth="3"
			className="fill-foreground stroke-muted"
			d="M280 115C280 103.954 288.954 95 300 95H314C332.778 95 348 110.222 348 129V143C348 154.046 339.046 163 328 163H300C288.954 163 280 154.046 280 143V115Z"
		/>
		<rect
			rx="20"
			x="280"
			y="169"
			width="68"
			height="68"
			strokeWidth="3"
			className="fill-foreground stroke-muted"
		/>
		<rect
			rx="20"
			x="206"
			y="243"
			width="68"
			height="68"
			strokeWidth="3"
			className="fill-foreground stroke-muted"
		/>
		<rect
			rx="20"
			x="252"
			y="263.083"
			width="68"
			height="68"
			strokeWidth="6"
			className="fill-primary stroke-muted"
			transform="rotate(-45 252 263.083)"
		/>
		<rect
			rx="4"
			x="265"
			y="165.728"
			width="18"
			height="18"
			className="fill-primary"
			transform="rotate(-45 265 165.728)"
		/>
		<rect
			rx="4"
			x="190"
			y="240.728"
			width="18"
			height="18"
			className="fill-primary"
			transform="rotate(-45 190 240.728)"
		/>
		<rect
			rx="4"
			x="190"
			y="165.728"
			width="18"
			height="18"
			className="fill-primary"
			transform="rotate(-45 190 165.728)"
		/>
	</svg>
));
