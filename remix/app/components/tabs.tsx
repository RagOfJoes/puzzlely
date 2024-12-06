import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/cn";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef<
	ElementRef<typeof TabsPrimitive.List>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.List
		ref={ref}
		className={cn(
			"inline-flex h-11 items-center gap-1 text-muted-foreground",

			className,
		)}
		{...props}
	/>
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = forwardRef<
	ElementRef<typeof TabsPrimitive.Trigger>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Trigger
		ref={ref}
		className={cn(
			"inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap border bg-background px-4 font-medium ring-offset-background transition-all",

			"data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
			"disabled:pointer-events-none disabled:opacity-50",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

			className,
		)}
		{...props}
	/>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = forwardRef<
	ElementRef<typeof TabsPrimitive.Content>,
	ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			"mt-1 ring-offset-background",

			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

			className,
		)}
		{...props}
	/>
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
