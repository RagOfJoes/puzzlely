import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import * as Select from "@radix-ui/react-select";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type SelectListItemProps = Select.SelectItemProps;

export const SelectListItem = forwardRef<ElementRef<typeof Primitive.div>, SelectListItemProps>(
	({ children, className, disabled, ...props }, ref) => (
		<Select.Item
			{...props}
			className={cn(
				"relative flex h-11 cursor-default select-none items-center gap-1 px-2 font-medium text-popover-foreground outline-none ring-offset-background transition-all",

				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				"data-[highlighted]:bg-primary  data-[highlighted]:text-primary-foreground",

				className,
			)}
			disabled={disabled}
			ref={ref}
		>
			<Select.ItemIndicator>
				<CheckIcon className="h-4 w-4" />
			</Select.ItemIndicator>

			<Select.ItemText asChild>
				<p>{children}</p>
			</Select.ItemText>
		</Select.Item>
	),
);
SelectListItem.displayName = "SelectListItem";
