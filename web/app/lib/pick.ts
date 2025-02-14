export function pick<T extends Record<string, any>, K extends keyof T>(
	object: T,
	keysToPick: K[] = [],
) {
	const picked: Record<string, unknown> = {};

	keysToPick.forEach((key) => {
		if (key in object) {
			picked[key as string] = object[key as string];
		}
	});

	return picked as Pick<T, K>;
}
