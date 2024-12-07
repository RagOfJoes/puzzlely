import type { SerializeFrom } from "@remix-run/node";

import type { GameSummary } from "@/types/game-summary";

import { hydratePuzzleSummary } from "./hydrate-puzzle-summary";
import { hydrateUser } from "./hydrate-user";

export function hydrateGameSummary(json: SerializeFrom<GameSummary>): GameSummary {
	return {
		...json,

		created_at: new Date(json.created_at),
		completed_at: json.completed_at ? new Date(json.completed_at) : undefined,

		puzzle: hydratePuzzleSummary(json.puzzle),
		user: hydrateUser(json.user),
	};
}
