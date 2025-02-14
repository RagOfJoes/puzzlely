import { forwardRef } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

export const Accordion = AccordionPrimitive.Root;

export const AccordionItem = forwardRef<
	ElementRef<typeof AccordionPrimitive.Item>,
	ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
	<AccordionPrimitive.Item
		ref={ref}
		className={cn(
			"border-b",

			className,
		)}
		{...props}
	/>
));
AccordionItem.displayName = "AccordionItem";

export const AccordionTrigger = forwardRef<
	ElementRef<typeof AccordionPrimitive.Trigger>,
	ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Header className="flex">
		<AccordionPrimitive.Trigger
			{...props}
			className={cn(
				"flex flex-1 items-center justify-between py-4 font-medium ring-offset-background transition-all",

				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"hover:underline",
				"[&[data-state=open]>svg]:rotate-180",

				className,
			)}
			ref={ref}
		>
			{children}
			<ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export const AccordionContent = forwardRef<
	ElementRef<typeof AccordionPrimitive.Content>,
	ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Content
		{...props}
		className={cn(
			"overflow-hidden text-sm transition-all",

			"data-[state=closed]:animate-accordion-up",
			"data-[state=open]:animate-accordion-down",
		)}
		ref={ref}
	>
		<div
			className={cn(
				"pb-4 pt-0",

				className,
			)}
		>
			{children}
		</div>
	</AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
