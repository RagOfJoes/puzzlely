import { redirect } from "react-router";

import { API } from "@/services/api.server";
import { destroySession, getSession } from "@/services/session.server";
import { redirectWithSuccess } from "@/services/toast.server";

import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
	// Make sure the request is a DELETE request
	if (request.method.toUpperCase() !== "DELETE") {
		return redirect("/profile");
	}

	const me = await API.me(request);
	if (!me.success || !me.data || !me.data.user) {
		return redirect("/");
	}

	await API.logout(request);

	const session = await getSession(request.headers.get("Cookie"));
	return redirectWithSuccess(
		"/",
		{
			message: "Successfully logged out!",
		},
		{
			headers: {
				"Set-Cookie": await destroySession(session),
			},
		},
	);
}
