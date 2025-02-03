import type { ComponentPropsWithoutRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import { useFormControlContext } from "./form-control-context";

export type FormControlErrorProps = ComponentPropsWithoutRef<typeof Primitive.p>;

export const FormControlError = forwardRef<HTMLParagraphElement, FormControlErrorProps>(
	(props, ref) => {
		const { getErrorProps } = useFormControlContext();

		return <Primitive.p {...getErrorProps(props, ref)} />;
	},
);
FormControlError.displayName = "FormControlError";
