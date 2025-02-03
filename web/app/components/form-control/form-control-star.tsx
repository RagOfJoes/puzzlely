import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { cn } from "@/lib/cn";

import { useFormControlContext } from "./form-control-context";

export type FormControlStarProps = ComponentPropsWithoutRef<typeof Primitive.span>;

export const FormControlStar = forwardRef<ElementRef<typeof Primitive.span>, FormControlStarProps>(
	(props, ref) => {
		const { children = "*", ...other } = props;

		const { disabled } = useFormControlContext();

		return (
			<Primitive.span
				{...other}
				ref={ref}
				className={cn({
					"text-destructive": !disabled,
					"text-muted-foreground": disabled,
				})}
			>
				{children}
			</Primitive.span>
		);
	},
);
FormControlStar.displayName = "FormControlStar";
