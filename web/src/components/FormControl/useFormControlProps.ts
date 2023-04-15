import { useFormControlCtx } from "./Context";
import type { UseFormControlProps } from "./types";

function useFormControlProps(props: UseFormControlProps): UseFormControlProps {
  const ctx = useFormControlCtx();

  const { id, disabled, invalid, readOnly, required, ...other } = props;

  const labelIDs: string[] = props["aria-describedby"]
    ? [props["aria-describedby"]]
    : [];
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

export default useFormControlProps;
