/**
 * NOTE: Taken from https://github.com/streamich/react-use/blob/master/src/useLocalStorage.ts
 */
import {
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
	type Dispatch,
	type SetStateAction,
} from "react";

const noop = () => {};

type ParserOptions<T> =
	| {
			raw: true;
	  }
	| {
			raw: false;
			serializer: (value: T) => string;
			deserializer: (value: string) => T;
	  };

export function useLocalStorage<T>(
	key: string,
	initialValue?: T,
	options?: ParserOptions<T>,
): [T | undefined, Dispatch<SetStateAction<T | undefined>>, () => void] {
	if (typeof window === "undefined") {
		return [initialValue, noop, noop];
	}

	if (!key) {
		throw new Error("useLocalStorage key may not be falsy");
	}

	let deserializer = JSON.parse;
	if (options && options.raw) {
		deserializer = (value) => value;
	} else if (options && typeof options.deserializer === "function") {
		deserializer = options.deserializer;
	}

	let serializer = JSON.stringify;
	if (options && options.raw) {
		serializer = String;
	} else if (typeof options?.serializer === "function") {
		serializer = options.serializer;
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const initializer = useRef((_key: string) => {
		try {
			const localStorageValue = localStorage.getItem(_key);
			if (localStorageValue !== null) {
				return deserializer(localStorageValue);
			}

			if (initialValue) {
				localStorage.setItem(_key, serializer(initialValue));
			}

			return initialValue;
		} catch {
			// If user is in private mode or has storage restriction
			// localStorage can throw. JSON.parse and JSON.stringify
			// can throw, too.
			return initialValue;
		}
	});

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const [state, setState] = useState<T | undefined>(() => initializer.current(key));

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useLayoutEffect(() => {
		setState(initializer.current(key));
	}, [key]);

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const set: Dispatch<SetStateAction<T | undefined>> = useCallback(
		(valOrFunc) => {
			try {
				const newState =
					typeof valOrFunc === "function" ? (valOrFunc as Function)(state) : valOrFunc;
				if (typeof newState === "undefined") {
					return;
				}

				let value = JSON.stringify(newState);
				if (options) {
					if (!options.raw && options.serializer) {
						value = options.serializer(newState);
					} else if (options.raw) {
						value = typeof newState === "string" ? newState : JSON.stringify(newState);
					}
				}

				localStorage.setItem(key, value);
				setState(deserializer(value));
			} catch {
				// If user is in private mode or has storage restriction
				// localStorage can throw. Also JSON.stringify can throw.
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[key, setState],
	);

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const remove = useCallback(() => {
		try {
			localStorage.removeItem(key);
			setState(undefined);
		} catch {
			// If user is in private mode or has storage restriction
			// localStorage can throw.
		}
	}, [key, setState]);

	return [state, set, remove];
}
