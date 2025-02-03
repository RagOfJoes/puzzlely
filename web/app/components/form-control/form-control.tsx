import type { ComponentPropsWithoutRef, ElementRef, ReactNode } from "react";
import { forwardRef, useMemo, Children } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { cn } from "@/lib/cn";
import { omit } from "@/lib/omit";

import { FormControlProvider } from "./form-control-context";
import { useFormControl } from "./use-form-control";

export type FormControlProps = ComponentPropsWithoutRef<typeof Primitive.div> & {
	disabled?: boolean;
	invalid?: boolean;
	readOnly?: boolean;
	required?: boolean;
};

export const FormControl = forwardRef<ElementRef<typeof Primitive.div>, FormControlProps>(
	(props, ref) => {
		const { className, children } = props;

		const ctx = useFormControl(props);

		const { error, helper, label, other } = useMemo(() => {
			const c: {
				error?: ReactNode;
				helper?: ReactNode;
				label?: ReactNode;
				other: ReactNode[];
			} = { other: [] };

			Children.toArray(children).forEach((child: any) => {
				switch (child?.type?.displayName) {
					case "FormControlError":
						c.error = child;
						break;
					case "FormControlHelper":
						c.helper = child;
						break;
					case "FormControlLabel":
						c.label = child;
						break;
					// TODO: Filter out valid inputs
					default:
						c.other = [...c.other, child];
				}
			});

			return c;
		}, [children]);

		return (
			<FormControlProvider value={ctx}>
				<Primitive.div
					{...omit(props, ["className", "children", "disabled", "invalid", "readOnly", "required"])}
					ref={ref}
					role="group"
					className={cn(
						"flex flex-col gap-1",

						className,
					)}
				>
					{label}

					{other}

					{error}
					{helper}
				</Primitive.div>
			</FormControlProvider>
		);
	},
);
FormControl.displayName = "FormControl";
