import { useCallback, useId, useState } from "react";

import clsx from "clsx";

import { mergeRefs } from "@/hooks/useMergeRefs";

import type { FormControlProps, UseFormControl } from "./types";

function useFormControl(props: FormControlProps): UseFormControl {
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
      className: clsx(
        "mt-1 text-xs text-red",

        {
          hidden: !invalid,
        },

        errorProps.className
      ),
      ref: mergeRefs(forwardedRef, (node) => {
        if (!node) {
          return;
        }

        setHasError(true);
      }),
    }),
    [errorID, invalid]
  );
  const getHelperProps = useCallback<UseFormControl["getHelperProps"]>(
    (helpTextProps, forwardedRef) => ({
      ...helpTextProps,
      id: helperID,
      className: clsx(
        "mt-1 text-xs",

        {
          "text-subtle": !disabled,
          "text-muted/60": disabled,

          hidden: invalid,
        },

        helpTextProps
      ),
      ref: mergeRefs(forwardedRef, (node) => {
        if (!node) {
          return;
        }

        setHasHelper(true);
      }),
    }),
    [disabled, helperID, invalid]
  );
  const getLabelProps = useCallback<UseFormControl["getLabelProps"]>(
    (labelProps = {}) => ({
      ...labelProps,
      className: clsx(
        "mb-2 font-medium",

        {
          "text-muted/60": disabled,
        },

        labelProps.className
      ),
      "data-disabled": disabled,
      "data-invalid": invalid,
      "data-readonly": readOnly,
      htmlFor: labelProps.htmlFor ?? id,
      id: labelProps.id ?? labelID,
    }),
    [disabled, id, invalid, labelID, readOnly]
  );

  return {
    disabled,
    errorID,
    hasError,
    hasHelper,
    helperID,
    labelID,
    getHelperProps,
    getErrorProps,
    getLabelProps,
    id,
    invalid,
    required,
  };
}

export default useFormControl;
