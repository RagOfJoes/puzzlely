import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { useFormControlContext } from "./form-control-context";

export type FormControlHelperProps = ComponentPropsWithoutRef<typeof Primitive.p>;

export const FormControlHelper = forwardRef<ElementRef<typeof Primitive.p>, FormControlHelperProps>(
	(props, ref) => {
		const { getHelperProps } = useFormControlContext();

		return <Primitive.p {...getHelperProps(props, ref)} />;
	},
);
FormControlHelper.displayName = "FormControlHelper";
