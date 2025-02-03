import { z } from "zod";

import type { Puzzle } from "@/types/puzzle";

export function decodePuzzle(puzzle: Puzzle): Puzzle {
	return {
		...puzzle,
		groups: puzzle.groups.map((group) => ({
			...group,
			blocks: group.blocks.map((block) => {
				if (!z.string().base64().safeParse(block.value).success) {
					return block;
				}

				return {
					...block,
					value: atob(block.value),
				};
			}),
		})),
	};
}
