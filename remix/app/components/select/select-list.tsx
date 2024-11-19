import type { ElementRef } from "react";
import { Children, forwardRef, useMemo } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

export type SelectListProps = Select.SelectContentProps;

export const SelectList = forwardRef<ElementRef<typeof Primitive.div>, SelectListProps>(
	(props, ref) => {
		const { children, className, ...other } = props;

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
					{...other}
					ref={ref}
					className={clsx(
						"z-10 overflow-hidden border bg-muted shadow",

						className,
					)}
				>
					<Select.ScrollUpButton className="flex h-6 items-center justify-center">
						<ChevronUpIcon />
					</Select.ScrollUpButton>

					<Select.Viewport className="">{items}</Select.Viewport>

					<Select.ScrollDownButton className="flex h-6 items-center justify-center">
						<ChevronDownIcon />
					</Select.ScrollDownButton>
				</Select.Content>
			</Select.Portal>
		);
	},
);
SelectList.displayName = "SelectList";
