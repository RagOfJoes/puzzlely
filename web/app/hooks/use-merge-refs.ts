import { useMemo } from "react";

export type ReactRef<T> = React.RefCallback<T> | React.MutableRefObject<T>;

export function assignRef<T = any>(ref: ReactRef<T> | null | undefined, value: T) {
	if (ref == null) return;

	if (typeof ref === "function") {
		ref(value);
		return;
	}

	try {
		// eslint-disable-next-line no-param-reassign
		ref.current = value;
	} catch (error) {
		throw new Error(`Cannot assign value '${value}' to ref '${ref}'`);
	}
}

export const mergeRefs =
	<T>(...refs: (ReactRef<T> | null | undefined)[]) =>
	(node: T | null) => {
		refs.forEach((ref) => {
			assignRef(ref, node);
		});
	};

export function useMergeRefs<T>(...refs: (ReactRef<T> | null | undefined)[]) {
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => mergeRefs(...refs), refs);
}
