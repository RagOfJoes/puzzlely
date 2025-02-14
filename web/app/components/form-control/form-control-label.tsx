import type { ElementRef } from "react";
import { forwardRef } from "react";

import * as Label from "@radix-ui/react-label";

import { useFormControlContext } from "./form-control-context";
import { FormControlStar } from "./form-control-star";

export type FormControlLabelProps = Label.LabelProps;

export const FormControlLabel = forwardRef<ElementRef<typeof Label.Root>, FormControlLabelProps>(
	(props, ref) => {
		const { asChild, children } = props;

		const { getLabelProps, required } = useFormControlContext();

		return (
			<Label.Root {...getLabelProps(props, ref)}>
				{asChild ? (
					children
				) : (
					<>
						{children}

						{required && <FormControlStar />}
					</>
				)}
			</Label.Root>
		);
	},
);
FormControlLabel.displayName = "FormControlLabel";
