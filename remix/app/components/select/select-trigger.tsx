import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type SelectTriggerProps = Select.SelectTriggerProps & {
	placeholder?: string;
};

export const SelectTrigger = forwardRef<ElementRef<typeof Primitive.button>, SelectTriggerProps>(
	({ className, placeholder = "...", ...props }, ref) => (
		<Select.Trigger
			{...props}
			className={cn(
				"group flex h-11 items-center gap-1 border bg-background px-2 font-medium outline-none ring-offset-background transition-all",

				"active:enabled:ring-2 active:enabled:ring-ring active:enabled:ring-offset-2",
				'aria-[invalid="true"]:border-destructive-foreground',
				"data-[placeholder]:enabled:text-muted-foreground",
				"disabled:text-muted-foreground",
				"focus:enabled:ring-2 focus:enabled:ring-ring focus:enabled:ring-offset-2",
				"focus-visible:enabled:ring-2 focus-visible:enabled:ring-ring focus-visible:enabled:ring-offset-2",

				className,
			)}
			ref={ref}
		>
			<span className="truncate">
				<Select.Value placeholder={placeholder} />
			</span>

			<Select.Icon>
				<ChevronDownIcon className="h-4 w-4" />
			</Select.Icon>
		</Select.Trigger>
	),
);
SelectTrigger.displayName = "SelectTrigger";
