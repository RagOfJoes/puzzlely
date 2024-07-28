import type { SerializeFrom } from "@remix-run/node";

import type { Puzzle } from "@/types/puzzle";

import { hydrateUser } from "./hydrate-user";

export function hydratePuzzle(json: SerializeFrom<Puzzle>): Puzzle {
	return {
		...json,
		liked_at: json.liked_at ? new Date(json.liked_at) : undefined,

		created_at: new Date(json.created_at),
		updated_at: json.updated_at ? new Date(json.updated_at) : undefined,

		created_by: hydrateUser(json.created_by),
	};
}
