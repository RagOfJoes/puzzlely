import type { GamePayload } from "@/types/game-payload";
import type { Puzzle, PuzzleBlock, PuzzleGroup } from "@/types/puzzle";

export function isGamePayloadValid(game: GamePayload, puzzle: Puzzle): boolean {
	const blocks: Record<string, PuzzleBlock> = {};
	const groups: Record<string, PuzzleGroup> = {};
	for (let i = 0; i < puzzle.groups.length; i += 1) {
		const group = puzzle.groups[i];
		if (!group) {
			return false;
		}
		groups[group.id] = group;

		for (let j = 0; j < group.blocks.length; j += 1) {
			const block = group.blocks[j];
			if (!block) {
				return false;
			}

			blocks[block.id] = block;
		}
	}

	// Check if attempts have valid ids
	for (let i = 0; i < game.attempts.length; i += 1) {
		const attempt = game.attempts[i];
		if (!attempt) {
			return false;
		}

		for (let j = 0; j < attempt.length; j += 1) {
			const block = attempt[j];
			if (!block || !blocks[block]) {
				return false;
			}
		}
	}

	// Check if correct have valid ids
	for (let i = 0; i < game.correct.length; i += 1) {
		const correct = game.correct[i];
		if (!correct || !groups[correct]) {
			return false;
		}
	}

	return true;
}
