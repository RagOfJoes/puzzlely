import type { SerializeFrom } from "@remix-run/node";

import type { GamePayload } from "@/types/game-payload";

export function hydrateGamePayload(json: SerializeFrom<GamePayload>): GamePayload {
	return {
		...json,

		completed_at: json.completed_at ? new Date(json.completed_at) : undefined,
	};
}
