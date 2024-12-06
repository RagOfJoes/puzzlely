import type {
	ComponentProps,
	ComponentPropsWithoutRef,
	CSSProperties,
	ElementRef,
	HTMLAttributes,
} from "react";
import { forwardRef } from "react";

import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/cn";

export const Drawer = ({
	shouldScaleBackground = true,
	...props
}: ComponentProps<typeof DrawerPrimitive.Root>) => (
	<DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
);
Drawer.displayName = "Drawer";

export const DrawerTrigger = DrawerPrimitive.Trigger;

export const DrawerPortal = DrawerPrimitive.Portal;

export const DrawerClose = DrawerPrimitive.Close;

export const DrawerOverlay = forwardRef<
	ElementRef<typeof DrawerPrimitive.Overlay>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Overlay
		{...props}
		className={cn(
			"fixed inset-0 z-50 bg-background/80",

			className,
		)}
		ref={ref}
	/>
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

export const DrawerContent = forwardRef<
	ElementRef<typeof DrawerPrimitive.Content>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<DrawerPortal>
		<DrawerOverlay />

		<DrawerPrimitive.Content
			{...props}
			className={cn(
				"group fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col",

				"data-[vaul-drawer-direction=left]:inset-x-auto data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:bottom-2 data-[vaul-drawer-direction=left]:left-2 data-[vaul-drawer-direction=left]:top-2 data-[vaul-drawer-direction=left]:mt-0 data-[vaul-drawer-direction=left]:w-[310px] data-[vaul-drawer-direction=left]:flex-row",
				"data-[vaul-drawer-direction=right]:inset-x-auto data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:bottom-2 data-[vaul-drawer-direction=right]:right-2 data-[vaul-drawer-direction=right]:top-2 data-[vaul-drawer-direction=right]:mt-0 data-[vaul-drawer-direction=right]:w-[310px] data-[vaul-drawer-direction=right]:flex-row",

				className,
			)}
			ref={ref}
			style={{ "--initial-transform": "calc(100% + 8px)" } as CSSProperties}
		>
			{children}
		</DrawerPrimitive.Content>
	</DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

export const DrawerDragHandler = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div
		aria-hidden
		className={cn(
			"mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted-foreground/40",

			"group-data-[vaul-drawer-direction=left]:hidden",
			"group-data-[vaul-drawer-direction=right]:hidden",

			className,
		)}
		{...props}
	/>
);
DrawerDragHandler.displayName = "DrawerDragHandler";

export const DrawerHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={cn(
			"flex flex-col p-4 text-center",

			"sm:text-left",

			className,
		)}
	/>
);
DrawerHeader.displayName = "DrawerHeader";

export const DrawerFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
	<div
		{...props}
		className={cn(
			"mt-auto flex flex-col gap-2 p-4",

			className,
		)}
	/>
);
DrawerFooter.displayName = "DrawerFooter";

export const DrawerTitle = forwardRef<
	ElementRef<typeof DrawerPrimitive.Title>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Title
		{...props}
		className={cn(
			"text-lg font-medium",

			className,
		)}
		ref={ref}
	/>
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

export const DrawerDescription = forwardRef<
	ElementRef<typeof DrawerPrimitive.Description>,
	ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DrawerPrimitive.Description
		{...props}
		className={cn(
			"text-xs font-medium text-muted-foreground",

			className,
		)}
		ref={ref}
	/>
));
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;
