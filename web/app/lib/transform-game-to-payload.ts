import type { Game } from "@/types/game";
import type { GamePayload } from "@/types/game-payload";

export function transformGameToPayload(game: Game): GamePayload {
	return {
		score: game.score,

		attempts: game.attempts,
		correct: game.correct,

		completed_at: game.completed_at,
	};
}
