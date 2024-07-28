import type { ButtonHTMLAttributes, ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/cn";

const variants = cva(
	[
		"inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors",

		"disabled:pointer-events-none disabled:opacity-50",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
	],
	{
		variants: {
			variant: {
				default: cn(
					"bg-primary text-primary-foreground",

					"hover:bg-primary/90",
				),
				destructive: cn(
					"bg-destructive text-destructive-foreground",

					"hover:bg-destructive/90",
				),
				ghost: "hover:bg-foreground/10 hover:text-foreground",
				link: cn(
					"text-primary underline-offset-4",

					"hover:underline",
				),
				outline: cn(
					"border bg-muted",

					"hover:bg-foreground/10 hover:text-foreground",
				),
				secondary: cn(
					"bg-secondary text-secondary-foreground",

					"hover:bg-secondary/80",
				),
			},
			size: {
				default: "h-10 px-4 py-2",
				icon: "h-10 w-10",
				lg: "h-11 px-8",
				sm: "h-9 px-3",
			},
		},
		defaultVariants: {
			size: "default",
			variant: "default",
		},
	},
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
	VariantProps<typeof variants> & {
		asChild?: boolean;
	};

export const Button = forwardRef<ElementRef<typeof Primitive.button>, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const C = asChild ? Slot : "button";

		return <C className={cn(variants({ variant, size, className }))} ref={ref} {...props} />;
	},
);
Button.displayName = "Button";
