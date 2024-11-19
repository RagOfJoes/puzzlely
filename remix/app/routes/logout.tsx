import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { API } from "@/services/api.server";
import { destroySession, getSession } from "@/services/session.server";

export async function action({ request }: ActionFunctionArgs) {
	// Make sure the request is a DELETE request
	if (request.method.toUpperCase() !== "DELETE") {
		return redirect("/profile");
	}

	// Check if user is already authenticated
	const me = await API.me(request);
	if (!me.success || !me.data || !me.data.user) {
		return redirect("/");
	}

	await API.logout(request);

	const session = await getSession(request.headers.get("Cookie"));
	return redirect("/", {
		headers: {
			"Set-Cookie": await destroySession(session),
		},
	});
}
