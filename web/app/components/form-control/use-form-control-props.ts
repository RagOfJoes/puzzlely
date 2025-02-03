import { useFormControlContext } from "./form-control-context";

export type UseFormControlProps = {
	"aria-describedby"?: string;
	"aria-invalid"?: boolean;
	"aria-readonly"?: boolean;
	"aria-required"?: boolean;
	disabled?: boolean;
	errorID?: string;
	helperID?: string;
	id?: string;
	invalid?: boolean;
	labelID?: string;
	readOnly?: boolean;
	required?: boolean;
};

export function useFormControlProps(props: UseFormControlProps): UseFormControlProps {
	const ctx = useFormControlContext();

	const { id, disabled, invalid, readOnly, required, ...other } = props;

	const labelIDs: string[] = props["aria-describedby"] ? [props["aria-describedby"]] : [];
	if (ctx?.hasError && ctx?.invalid) {
		labelIDs.push(ctx.errorID);
	}
	if (ctx?.hasHelper) {
		labelIDs.push(ctx.helperID);
	}

	return {
		...other,
		"aria-describedby": labelIDs.join(" ") || undefined,
		"aria-invalid": invalid ?? ctx?.invalid,
		"aria-readonly": readOnly ?? ctx?.readOnly,
		"aria-required": required ?? ctx?.required,
		id: id ?? ctx?.id,
		disabled: disabled ?? ctx?.disabled,
		invalid: invalid ?? ctx?.invalid,
		readOnly: readOnly ?? ctx?.readOnly,
		required: required ?? ctx?.required,
	};
}
