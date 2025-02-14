import type { Game } from "@/types/game";
import type { History } from "@/types/history";
import { HistorySchema } from "@/types/history";
import type { PuzzleNode } from "@/types/puzzle-node";

const MAX_SIZE = 10;

export function getHistory(obj: any): History {
	const history = HistorySchema.safeParse(obj);

	return !history.success
		? {
				puzzles: [],
			}
		: history.data;
}

export function completePuzzle(game: Game, history: History): History {
	if (!game.completed_at) {
		return history;
	}

	const last = history.puzzles?.[0];
	if (!last) {
		return history;
	}

	if (last.id !== game.puzzle.id) {
		return history;
	}

	return {
		...history,
		puzzles: history.puzzles.filter((puzzle) => puzzle.id !== game.puzzle.id),
		updated_at: new Date(),
	};
}

export function updateHistory(current: PuzzleNode, history: History): History {
	const updated = { ...history };

	const isCurrent = current.cursor === history.puzzles?.[0]?.cursor;
	const shouldAdd = !isCurrent || history.puzzles.length === 0;

	if (shouldAdd) {
		updated.puzzles = [
			{ id: current.node.id, cursor: current.cursor, timestamp: new Date() },
			...history.puzzles,
		].slice(0, MAX_SIZE);
		updated.updated_at = new Date();
	}

	return updated;
}
