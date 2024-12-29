/**
 * NOTE: Taken from https://github.com/streamich/react-use/blob/master/src/useAsyncFn.ts
 */
import type { DependencyList } from "react";
import { useCallback, useRef, useState } from "react";

import { useIsMounted } from "@/hooks/use-is-mounted";
import type { FunctionReturningPromise, PromiseType } from "@/types/promises";

export type AsyncState<T> =
	| {
			loading: boolean;
			error?: undefined;
			value?: undefined;
	  }
	| {
			loading: true;
			error?: Error | undefined;
			value?: T;
	  }
	| {
			loading: false;
			error: Error;
			value?: undefined;
	  }
	| {
			loading: false;
			error?: undefined;
			value: T;
	  };

export type UseAsyncFn<T extends FunctionReturningPromise = FunctionReturningPromise> = [
	AsyncState<PromiseType<ReturnType<T>>>,
	T,
];

export default function useAsyncFn<T extends FunctionReturningPromise = FunctionReturningPromise>(
	fn: T,
	deps: DependencyList = [],
	initialState: UseAsyncFn<T>[0] = { loading: false },
): UseAsyncFn {
	const lastCallID = useRef(0);

	const isMounted = useIsMounted();

	const [state, set] = useState<UseAsyncFn<T>[0]>(initialState);

	const callback = useCallback((...args: Parameters<T>): ReturnType<T> => {
		const currentCallID = lastCallID.current + 1;

		if (!state.loading) {
			set((prevState) => ({ ...prevState, loading: true }));
		}

		return fn(...args).then(
			(value) => {
				if (isMounted() && currentCallID === lastCallID.current) {
					set({ loading: false, value });
				}

				return value;
			},
			(error) => {
				if (isMounted() && currentCallID === lastCallID.current) {
					set({ error, loading: false });
				}

				return error;
			},
		) as ReturnType<T>;

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return [state, callback as unknown as T];
}
