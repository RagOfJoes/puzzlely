export function setSearchParams(
	searchParams: URLSearchParams,
	changes: Record<string, string | number | undefined>,
): string {
	const newSearchParams = new URLSearchParams(searchParams);

	// eslint-disable-next-line no-restricted-syntax
	for (const [key, value] of Object.entries(changes)) {
		if (value === undefined) {
			newSearchParams.delete(key);

			// eslint-disable-next-line no-continue
			continue;
		}
		newSearchParams.set(key, String(value));
	}

	return Array.from(newSearchParams.entries())
		.map(([key, value]) => (value ? `${key}=${encodeURIComponent(value)}` : key))
		.join("&");
}
