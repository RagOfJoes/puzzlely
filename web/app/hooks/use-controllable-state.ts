import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { useCallbackRef } from "@/hooks/use-callback-ref";

export type UseControllableStateProps<T> = {
	defaultValue?: T | (() => T);
	onChange?: (value: T) => void;
	shouldUpdate?: (prev: T, next: T) => boolean;
	value?: T;
};

export function useControllableState<T>(props: UseControllableStateProps<T>) {
	const {
		value: valueProp,
		defaultValue,
		onChange,
		shouldUpdate = (prev, next) => prev !== next,
	} = props;

	const onChangeProp = useCallbackRef(onChange);
	const shouldUpdateProp = useCallbackRef(shouldUpdate);

	const [uncontrolledState, setUncontrolledState] = useState(defaultValue as T);
	const controlled = valueProp !== undefined;
	const value = controlled ? valueProp : uncontrolledState;

	const setValue = useCallbackRef(
		(next: SetStateAction<T>) => {
			const setter = next as (prevState?: T) => T;
			const nextValue = typeof next === "function" ? setter(value) : next;

			if (!shouldUpdateProp(value, nextValue)) {
				return;
			}

			if (!controlled) {
				setUncontrolledState(nextValue);
			}

			onChangeProp(nextValue);
		},
		[controlled, onChangeProp, value, shouldUpdateProp],
	);

	return [value, setValue] as [T, Dispatch<SetStateAction<T>>];
}
