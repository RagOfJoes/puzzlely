import { useCallback, useId, useState } from "react";

import { mergeRefs } from "@/hooks/use-merge-refs";
import { cn } from "@/lib/cn";

import type { FormControlProps } from "./form-control";
import type { UseFormControl } from "./form-control-context";

export function useFormControl(props: FormControlProps): UseFormControl {
	const { disabled, id: idProp, invalid, readOnly, required } = props;

	const [hasError, setHasError] = useState(false);
	const [hasHelper, setHasHelper] = useState(false);

	const uniqueID = useId();
	const id = idProp || `formControl-${uniqueID}`;

	const labelID = `${id}-label`;
	const errorID = `${id}-error`;
	const helperID = `${id}-helptext`;

	const getErrorProps = useCallback<UseFormControl["getErrorProps"]>(
		(errorProps, forwardedRef) => ({
			...errorProps,
			id: errorID,
			"aria-live": "polite",
			className: cn(
				"text-xs text-destructive",

				{
					hidden: !invalid,
				},

				errorProps.className,
			),
			ref: mergeRefs(forwardedRef, (node) => {
				if (!node) {
					return;
				}

				setHasError(true);
			}),
		}),
		[errorID, invalid],
	);
	const getHelperProps = useCallback<UseFormControl["getHelperProps"]>(
		(helpTextProps, forwardedRef) => ({
			...helpTextProps,
			id: helperID,
			className: cn(
				"text-xs text-muted-foreground",

				{
					hidden: invalid,
				},

				helpTextProps,
			),
			ref: mergeRefs(forwardedRef, (node) => {
				if (!node) {
					return;
				}

				setHasHelper(true);
			}),
		}),
		[helperID, invalid],
	);
	const getLabelProps = useCallback<UseFormControl["getLabelProps"]>(
		(labelProps, forwardedRef) => ({
			...labelProps,
			className: cn(
				"text-sm font-medium ",

				{
					"text-muted-foreground": disabled,
				},

				labelProps.className,
			),
			"data-disabled": disabled,
			"data-invalid": invalid,
			"data-readonly": readOnly,
			htmlFor: labelProps.htmlFor ?? id,
			id: labelProps.id ?? labelID,
			ref: forwardedRef,
		}),
		[disabled, id, invalid, labelID, readOnly],
	);

	return {
		disabled,
		errorID,
		getErrorProps,
		getHelperProps,
		getLabelProps,
		hasError,
		hasHelper,
		helperID,
		id,
		invalid,
		labelID,
		required,
	};
}
