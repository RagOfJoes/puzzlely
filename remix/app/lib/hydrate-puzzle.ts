import type { SerializeFrom } from "@remix-run/node";
import { z } from "zod";

import type { Puzzle } from "@/types/puzzle";

import { hydrateUser } from "./hydrate-user";

export function hydratePuzzle(json: SerializeFrom<Puzzle>): Puzzle {
	const groups = json.groups.map((group) => ({
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
	}));

	return {
		...json,
		groups,

		liked_at: json.liked_at ? new Date(json.liked_at) : undefined,

		created_at: new Date(json.created_at),
		updated_at: json.updated_at ? new Date(json.updated_at) : undefined,

		created_by: hydrateUser(json.created_by),
	};
}
