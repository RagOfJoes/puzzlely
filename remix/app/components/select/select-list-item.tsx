import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import * as Select from "@radix-ui/react-select";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type SelectListItemProps = Select.SelectItemProps;

export const SelectListItem = forwardRef<ElementRef<typeof Primitive.div>, SelectListItemProps>(
	(props, ref) => {
		const { children, className, disabled, ...other } = props;

		return (
			<Select.Item
				{...other}
				ref={ref}
				disabled={disabled}
				className={cn(
					"relative flex h-11 select-none items-center gap-1 px-2 font-medium text-muted-foreground outline-none ring-offset-background transition-all",

					"data-[disabled]:pointer-events-none data-[disabled]:text-muted",
					"data-[highlighted]:bg-foreground/10 data-[highlighted]:data-[state=unchecked]:text-foreground/80",
					"data-[state=checked]:font-bold data-[state=checked]:text-foreground",
					"hover:bg-muted/10",

					className,
				)}
			>
				<Select.ItemText asChild>
					<p>{children}</p>
				</Select.ItemText>

				<Select.ItemIndicator>
					<CheckIcon size={16} />
				</Select.ItemIndicator>
			</Select.Item>
		);
	},
);
SelectListItem.displayName = "SelectListItem";
