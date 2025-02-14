export function isDeepEqual<T>(obj1: T, obj2: T): boolean {
	// Primitive types and null/undefined
	//

	if (obj1 === obj2) {
		return true;
	}
	if (obj1 == null || obj2 == null || typeof obj1 !== "object" || typeof obj2 !== "object") {
		return false;
	}
	if (typeof obj1 !== "object" || typeof obj2 !== "object") {
		return false;
	}

	// Arrays
	//

	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if (obj1.length !== obj2.length) {
			return false;
		}

		return obj1.every((item, index) => isDeepEqual(item, obj2[index]));
	}

	// Dates
	//

	if (obj1 instanceof Date && obj2 instanceof Date) {
		return obj1.getTime() === obj2.getTime();
	}

	// Objects
	//

	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	return keys1.every(
		(key) =>
			Object.prototype.hasOwnProperty.call(obj2, key) &&
			isDeepEqual(obj1[key as keyof T], obj2[key as keyof T]),
	);
}
