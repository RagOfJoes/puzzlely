/**
 * NOTE: Taken from: https://usehooks-ts.com/react-hook/use-local-storage
 */

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import { useEventCallback } from "@/hooks/use-event-callback";
import { useEventListener } from "@/hooks/use-event-listener";

declare global {
	interface WindowEventMap {
		"local-storage": CustomEvent;
	}
}

const IS_SERVER = typeof window === "undefined";

export type UseLocalStorageOptions<T> = {
	deserializer?: (value: string) => T;
	initializeWithValue?: boolean;
	serializer?: (value: T) => string;
};

export type UseLocalStorage<T> = [value: T, set: Dispatch<SetStateAction<T>>, remove: () => void];

export function useLocalStorage<T>(
	key: string,
	initialValue: T | (() => T),
	options: UseLocalStorageOptions<T> = {
		initializeWithValue: true,
	},
): UseLocalStorage<T> {
	const deserializer = useCallback<(value: string) => T>(
		(value) => {
			if (options.deserializer) {
				return options.deserializer(value);
			}

			// Support 'undefined' as a value
			if (value === "undefined") {
				return undefined as unknown as T;
			}

			const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;

			let parsed: unknown;
			try {
				parsed = JSON.parse(value);
			} catch (error) {
				console.error("[useLocalStorage]: Error parsing JSON:", error);

				return defaultValue; // Return initialValue if parsing fails
			}

			return parsed as T;
		},
		[options, initialValue],
	);

	const serializer = useCallback<(value: T) => string>(
		(value) => {
			if (options.serializer) {
				return options.serializer(value);
			}

			return JSON.stringify(value);
		},
		[options],
	);

	// Get from local storage then
	// parse stored json or return initialValue
	const read = useCallback((): T => {
		const initialValueToUse = initialValue instanceof Function ? initialValue() : initialValue;

		// Prevent build error "window is undefined" but keep working
		if (IS_SERVER) {
			return initialValueToUse;
		}

		try {
			const raw = window.localStorage.getItem(key);
			return raw ? deserializer(raw) : initialValueToUse;
		} catch (error) {
			console.warn(`[useLocalStorage]: Error reading localStorage key “${key}”:`, error);

			return initialValueToUse;
		}
	}, [initialValue, key, deserializer]);

	const [value, setValue] = useState(() => {
		if (options.initializeWithValue) {
			return read();
		}

		return initialValue instanceof Function ? initialValue() : initialValue;
	});

	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const set: Dispatch<SetStateAction<T>> = useEventCallback((v) => {
		// Prevent build error "window is undefined" but keeps working
		if (IS_SERVER) {
			console.warn(
				`[useLocalStorage]: Tried setting localStorage key “${key}” even though environment is not a client`,
			);
		}

		try {
			// Allow value to be a function so we have the same API as useState
			const newValue = v instanceof Function ? v(read()) : v;

			// Save to local storage
			window.localStorage.setItem(key, serializer(newValue));

			// Save state
			setValue(newValue);

			// We dispatch a custom event so every similar useLocalStorage hook is notified
			window.dispatchEvent(new StorageEvent("local-storage", { key }));
		} catch (error) {
			console.warn(`[useLocalStorage]: Error setting localStorage key “${key}”:`, error);
		}
	});

	const remove = useEventCallback(() => {
		// Prevent build error "window is undefined" but keeps working
		if (IS_SERVER) {
			console.warn(
				`[useLocalStorage]: Tried removing localStorage key “${key}” even though environment is not a client`,
			);
		}

		const defaultValue = initialValue instanceof Function ? initialValue() : initialValue;

		// Remove the key from local storage
		window.localStorage.removeItem(key);

		// Save state with default value
		setValue(defaultValue);

		// We dispatch a custom event so every similar useLocalStorage hook is notified
		window.dispatchEvent(new StorageEvent("local-storage", { key }));
	});

	useEffect(() => {
		setValue(read());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key]);

	const handleStorageChange = useCallback(
		(event: StorageEvent | CustomEvent) => {
			if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
				return;
			}

			setValue(read());
		},
		[key, read],
	);

	// this only works for other documents, not the current one
	useEventListener("storage", handleStorageChange);

	// this is a custom event, triggered in writeValueToLocalStorage
	// See: useLocalStorage()
	useEventListener("local-storage", handleStorageChange);

	return [value, set, remove];
}
