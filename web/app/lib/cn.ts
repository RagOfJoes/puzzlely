import { type ClassValue, clsx } from "clsx";
// eslint-disable-next-line import/no-extraneous-dependencies
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
