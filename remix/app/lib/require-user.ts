import { redirect } from "@remix-run/node";

import { API } from "@/services/api.server";
import type { User } from "@/types/user";

export async function requireUser(request: Request): Promise<User> {
	const me = await API.me(request);
	if (!me.success || !me.data || !me.data.user) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw redirect("/login", {
			status: 302,
			statusText: "Unauthorized",
		});
	}

	return me.data.user;
}
