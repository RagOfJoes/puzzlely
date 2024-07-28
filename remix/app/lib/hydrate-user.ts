import type { SerializeFrom } from "@remix-run/node";

import type { User } from "@/types/user";

export function hydrateUser(json: SerializeFrom<User>): User {
	return {
		...json,

		created_at: new Date(json.created_at),
		updated_at: json.updated_at ? new Date(json.updated_at) : undefined,
	};
}
