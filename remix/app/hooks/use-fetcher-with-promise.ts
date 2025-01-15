import { useCallback, useEffect, useRef } from "react";

import { useFetcher } from "react-router";

type FetcherData<T> = NonNullable<T>;
type ResolvedFunction<T> = (value: FetcherData<T>) => void;

export function useFetcherWithPromise<T>(opts?: Parameters<typeof useFetcher>[0]) {
	const fetcher = useFetcher<T>(opts);

	// @ts-expect-error
	const promiseRef = useRef<Promise<FetcherData<typeof fetcher.data>>>();
	// @ts-expect-error
	const resolveRef = useRef<ResolvedFunction<FetcherData<typeof fetcher.data>>>();

	if (!promiseRef.current) {
		promiseRef.current = new Promise<FetcherData<typeof fetcher.data>>((resolve) => {
			resolveRef.current = resolve;
		});
	}

	const reset = useCallback(() => {
		promiseRef.current = new Promise((resolve) => {
			resolveRef.current = resolve;
		});
	}, [promiseRef, resolveRef]);

	const submit = useCallback(
		async (...args: Parameters<typeof fetcher.submit>) => {
			fetcher.submit(...args);
			return promiseRef.current;
		},
		[fetcher],
	);

	useEffect(() => {
		if (fetcher.state !== "idle" || !fetcher.data) {
			return;
		}

		resolveRef.current?.(fetcher.data);
		reset();
	}, [fetcher, reset]);

	return {
		submit,
	};
}
