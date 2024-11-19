import type { ElementRef, ReactNode } from "react";
import { Children, cloneElement, forwardRef, useId, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import * as RadixSelect from "@radix-ui/react-select";

import { useControllableState } from "@/hooks/use-controllable-state";
import { omit } from "@/lib/omit";
import { pick } from "@/lib/pick";

import { useFormControlProps } from "../form-control";

export type SelectProps = RadixSelect.SelectProps & {
	className?: string;
	invalid?: boolean;
};

export const Select = forwardRef<ElementRef<typeof Primitive.div>, SelectProps>((props, ref) => {
	const {
		children,
		className,
		onValueChange: onValueChangeProp,
		value: valueProp,
		...other
	} = props;

	const id = useId();
	const ctx = useFormControlProps({
		...pick(props, ["disabled", "invalid", "required"]),
	});

	const [value, setValue] = useControllableState({
		onChange: onValueChangeProp,
		value: valueProp,
	});

	// Filter children and ensure that the render order is correct
	const { trigger, list } = useMemo(() => {
		const c: { trigger?: ReactNode; list?: ReactNode } = {};

		Children.toArray(children).forEach((child: any) => {
			switch (child?.type?.displayName) {
				case "SelectTrigger":
					// Pass invalid state to trigger child
					c.trigger = cloneElement(child, {
						"aria-invalid": ctx?.invalid ? "true" : "false",
						id: ctx?.id ?? id,
					});
					break;
				case "SelectList":
					c.list = child;
					break;
				default:
					break;
			}
		});

		return c;
	}, [children, ctx?.id, ctx?.invalid, id]);

	return (
		<Primitive.div className={className} ref={ref}>
			<RadixSelect.Root
				{...omit(other, ["disabled", "required"])}
				{...omit(ctx, ["invalid", "readOnly"])}
				onValueChange={setValue}
				value={value}
			>
				{trigger}

				{list}
			</RadixSelect.Root>
		</Primitive.div>
	);
});
Select.displayName = "Select";
