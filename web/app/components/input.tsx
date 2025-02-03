import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { useFormControlProps } from "@/components/form-control";
import { cn } from "@/lib/cn";
import { omit } from "@/lib/omit";
import { pick } from "@/lib/pick";

export type InputProps = ComponentPropsWithoutRef<typeof Primitive.input> & {
	invalid?: boolean;
};

export const Input = forwardRef<ElementRef<typeof Primitive.input>, InputProps>(
	({ className, placeholder = "...", ...props }, ref) => {
		const ctx = useFormControlProps(
			pick(props, ["disabled", "id", "invalid", "readOnly", "required"]),
		);

		return (
			<div className="relative flex w-full">
				<Primitive.input
					{...omit(props, ["disabled", "id", "invalid", "readOnly", "required"])}
					{...omit(ctx, ["invalid"])}
					className={cn(
						"relative h-11 w-full min-w-0 appearance-none border bg-transparent px-2 outline-none ring-offset-background transition-[background-color,box-shadow,color]",

						"[&::-webkit-inner-spin-button]:appearance-none",
						"aria-[invalid=true]:enabled:border-destructive",
						"disabled:opacity-50",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						"placeholder:enabled:text-muted-foreground",

						className,
					)}
					placeholder={placeholder}
					ref={ref}
				/>
			</div>
		);
	},
);
Input.displayName = "Input";
