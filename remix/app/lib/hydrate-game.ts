import type { SerializeFrom } from "@remix-run/node";

import type { Game } from "@/types/game";

import { hydratePuzzle } from "./hydrate-puzzle";
import { hydrateUser } from "./hydrate-user";

export function hydrateGame(json: SerializeFrom<Game>): Game {
	return {
		...json,
		puzzle: hydratePuzzle(json.puzzle),

		completed_at: json.completed_at ? new Date(json.completed_at) : undefined,
		created_at: new Date(json.created_at),
		started_at: json.started_at ? new Date(json.started_at) : undefined,

		user: json.user ? hydrateUser(json.user) : undefined,
	};
}
