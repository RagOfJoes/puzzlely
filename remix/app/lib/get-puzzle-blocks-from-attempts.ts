import type { Game } from "@/types/game";
import type { PuzzleBlock } from "@/types/puzzle";

export function getPuzzleBlocksFromAttempts(blocks: PuzzleBlock[], game: Game): PuzzleBlock[][] {
	const joined: PuzzleBlock[][] = [];

	for (let i = 0; i < game.attempts.length; i += 1) {
		const temp: PuzzleBlock[] = [];

		const attempt = game.attempts[i];
		if (!attempt) {
			// eslint-disable-next-line no-continue
			continue;
		}

		for (let j = 0; j < attempt.length; j += 1) {
			const blockID = attempt[j];
			if (!blockID) {
				// eslint-disable-next-line no-continue
				continue;
			}

			for (let k = 0; k < blocks.length; k += 1) {
				const block = blocks[k];
				if (!block) {
					// eslint-disable-next-line no-continue
					continue;
				}

				if (blockID === block.id) {
					temp.push(block);
					break;
				}
			}
		}

		joined.push(temp.length === attempt.length ? temp : []);
	}

	return joined;
}
