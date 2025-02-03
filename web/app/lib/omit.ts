export function omit<T extends Record<string, any>, K extends keyof T>(
	object: T,
	keysToOmit: K[] = [],
) {
	const clone: Record<string, unknown> = { ...object };
	keysToOmit.forEach((key) => {
		if (key in clone) {
			delete clone[key as string];
		}
	});

	return clone as Omit<T, K>;
}
