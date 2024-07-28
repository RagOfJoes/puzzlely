import type { PuzzleBlock } from "@/types/puzzle";

export function arePuzzleBlocksSameGroup(attempt: PuzzleBlock[]): boolean {
	const firstAttempt = attempt[0];
	if (!firstAttempt) {
		return false;
	}

	return attempt.every((block) => block.group_id === firstAttempt.group_id);
}
