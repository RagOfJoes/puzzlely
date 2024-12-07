import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { AlertCircleIcon, CircleCheckIcon, InfoIcon, LoaderCircleIcon } from "lucide-react";
import { Toaster as Sonner } from "sonner";

import { cn } from "@/lib/cn";

export type ToasterProps = ComponentPropsWithoutRef<typeof Sonner>;

export const Toaster = forwardRef<ElementRef<typeof Sonner>, ToasterProps>(
	({ className, ...props }, ref) => (
		<Sonner
			{...props}
			className={cn(
				"toaster group",

				className,
			)}
			gap={4}
			icons={{
				error: <AlertCircleIcon className="h-4 w-4" />,
				info: <InfoIcon className="h-4 w-4" />,
				loading: <LoaderCircleIcon className="h-4 w-4 animate-spin" />,
				success: <CircleCheckIcon className="h-4 w-4" />,
			}}
			offset={16}
			ref={ref}
			toastOptions={{
				classNames: {
					toast: cn(
						"toast group font-sans",

						"group-[.toaster]:rounded-xl group-[.toaster]:border-border group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground",
						"data-[type=error]:group-[.toaster]:border-destructive data-[type=error]:group-[.toaster]:bg-destructive data-[type=error]:group-[.toaster]:text-destructive-foreground",
						"data-[type=success]:group-[.toaster]:border-success data-[type=success]:group-[.toaster]:bg-success data-[type=success]:group-[.toaster]:text-success-foreground",
						"data-[type=warning]:group-[.toaster]:border-warning data-[type=warning]:group-[.toaster]:bg-warning data-[type=warning]:group-[.toaster]:text-warning-foreground",
					),

					actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
					cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
					content: "flex flex-col",
					description: cn(
						"text-xs font-medium text-muted-foreground",

						"group-data-[type=error]:text-destructive-foreground",
						"group-data-[type=success]:text-success-foreground",
						"group-data-[type=warning]:text-warning-foreground",
					),
					title: "text-sm font-medium",
				},
			}}
		/>
	),
);
Toaster.displayName = "Toaster";
