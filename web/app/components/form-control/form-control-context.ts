import type { ElementRef, ForwardedRef } from "react";

import type { Label } from "@radix-ui/react-label";
import type { Primitive } from "@radix-ui/react-primitive";

import { createContext } from "@/lib/create-context";

import type { FormControlErrorProps } from "./form-control-error";
import type { FormControlHelperProps } from "./form-control-helper";
import type { FormControlLabelProps } from "./form-control-label";

export type UseFormControl = {
	disabled?: boolean;
	errorID: string;
	getErrorProps: (
		props: FormControlErrorProps,
		ref: ForwardedRef<ElementRef<typeof Primitive.p>>,
	) => FormControlErrorProps & {
		ref: ForwardedRef<ElementRef<typeof Primitive.p>>;
	};
	getHelperProps: (
		props: FormControlHelperProps,
		ref: ForwardedRef<ElementRef<typeof Primitive.p>>,
	) => FormControlHelperProps & {
		ref: ForwardedRef<ElementRef<typeof Primitive.p>>;
	};
	getLabelProps: (
		props: FormControlLabelProps,
		ref: ForwardedRef<ElementRef<typeof Label>>,
	) => FormControlLabelProps & {
		ref: ForwardedRef<ElementRef<typeof Label>>;
	};
	hasError?: boolean;
	hasHelper?: boolean;
	helperID: string;
	id: string;
	invalid?: boolean;
	labelID: string;
	readOnly?: boolean;
	required?: boolean;
};

export const [FormControlProvider, useFormControlContext] = createContext<UseFormControl>({
	hookName: "useFormControlContext",
	name: "FormControl",
	providerName: "FormControlProvider",
	strict: false,
});
