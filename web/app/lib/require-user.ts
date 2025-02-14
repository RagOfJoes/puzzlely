import { API } from "@/services/api.server";
import { redirectWithError } from "@/services/toast.server";
import type { User } from "@/types/user";

export async function requireUser(request: Request): Promise<User> {
	const me = await API.me(request);
	if (!me.success || !me.data || !me.data.user) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw await redirectWithError("/login", {
			description: "To access this feature.",
			message: "You must be logged in!",
		});
	}

	return me.data.user;
}
