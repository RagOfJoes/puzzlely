/**
 * Checks if the given value is a number
 *
 * @param value - Given value that will be checked
 * @returns `true` if the given value is a number, `false` otherwise
 */
export function isNumber(value: any): value is number {
	return (
		(typeof value === "number" && value - value === 0) ||
		(typeof value === "string" && Number.isFinite(+value) && value.trim() !== "")
	);
}
