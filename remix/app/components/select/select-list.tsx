import type { ElementRef } from "react";
import { Children, forwardRef, useMemo } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type SelectListProps = Select.SelectContentProps;

export const SelectList = forwardRef<ElementRef<typeof Primitive.div>, SelectListProps>(
	({ children, className, position, ...props }, ref) => {
		const items = useMemo(
			() =>
				Children.toArray(children).filter(
					(child: any) => child?.type?.displayName === "SelectListItem",
				),
			[children],
		);

		return (
			<Select.Portal>
				<Select.Content
					{...props}
					className={clsx(
						"z-10 overflow-hidden border bg-popover",

						className,
					)}
					position={position}
					ref={ref}
				>
					<Select.ScrollUpButton className="flex h-6 items-center justify-center">
						<ChevronUpIcon />
					</Select.ScrollUpButton>

					<Select.Viewport
						className={cn(
							"",

							position === "popper" &&
								"h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
						)}
					>
						{items}
					</Select.Viewport>

					<Select.ScrollDownButton className="flex h-6 items-center justify-center">
						<ChevronDownIcon />
					</Select.ScrollDownButton>
				</Select.Content>
			</Select.Portal>
		);
	},
);
SelectList.displayName = "SelectList";
