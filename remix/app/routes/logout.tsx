import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import cookie from "cookie";

import { API } from "@/services/api.server";

const SID_COOKIE = "puzzlely_sid";

export async function action({ request }: ActionFunctionArgs) {
	// Make sure the request is a DELETE request
	if (request.method.toUpperCase() !== "DELETE") {
		return redirect("/profile");
	}

	// Check if user is already authenticated
	const me = await API.me(request);
	if (!me.success || !me.payload || !me.payload.user) {
		return redirect("/");
	}

	await API.logout(request);

	// Clear the session cookie
	const serialized = cookie.serialize(SID_COOKIE, "", {
		httpOnly: process.env.NODE_ENV === "production",
		maxAge: -1,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
	});

	return redirect("/", {
		headers: {
			"Set-Cookie": serialized,
		},
	});
}
