import crypto from "crypto";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { API } from "@/services/api.server";
import { state } from "@/services/cookies.server";
import { commitSession, getSession } from "@/services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
	// Check if user is already authenticated
	const me = await API.me(request);
	if (me.success && me.data.user) {
		return me.data.user.state === "COMPLETE" ? redirect("/") : redirect("/profile");
	}

	const session = await getSession(request.headers.get("Cookie"));

	const cookie = (await state.parse(request.headers.get("cookie"))) as null | string;
	if (!cookie || cookie.length <= 0) {
		const [committedSession, serializedState] = await Promise.all([
			commitSession(session),
			// Remove state cookie just to be safe ;)
			state.serialize(cookie, {
				maxAge: -1,
			}),
		]);

		return redirect("/login", {
			headers: [
				["Set-Cookie", committedSession],
				["Set-Cookie", serializedState],
			],
			status: 302,
			statusText: "Failed to retrieve state.",
		});
	}

	const params = new URLSearchParams({
		client_id: process.env.DISCORD_OAUTH2_CLIENT_ID ?? "",
		client_secret: process.env.DISCORD_OAUTH2_CLIENT_SECRET ?? "",
		prompt: "none",
		response_type: "code",
		scope: "identify",
		state: cookie,
	});
	return redirect(`https://discord.com/oauth2/authorize?${params.toString()}`, {});
}

export async function action({ request }: ActionFunctionArgs) {
	// Check if user is already authenticated
	const me = await API.me(request);
	if (me.success && me.data.user) {
		return me.data.user.state === "COMPLETE" ? redirect("/") : redirect("/profile");
	}

	const session = await getSession(request.headers.get("Cookie"));

	// TODO: Ensure this doesn't cause an infinite loop
	// NOTE: Hack to set state cookie
	// If state isn't present yet, then, set it and redirect back to this route
	const cookie = (await state.parse(request.headers.get("cookie"))) as null | string;
	if (!cookie) {
		const [committedSession, serializedState] = await Promise.all([
			commitSession(session),
			state.serialize(crypto.randomBytes(32).toString("hex"), {
				// 10 minutes
				maxAge: 600000,
			}),
		]);

		return redirect("/auth/discord", {
			headers: [
				["Set-Cookie", committedSession],
				["Set-Cookie", serializedState],
			],
			status: 302,
		});
	}

	const params = new URLSearchParams({
		client_id: process.env.DISCORD_OAUTH2_CLIENT_ID ?? "",
		client_secret: process.env.DISCORD_OAUTH2_CLIENT_SECRET ?? "",
		prompt: "none",
		response_type: "code",
		scope: "identify",
		state: cookie,
	});
	return redirect(`https://discord.com/oauth2/authorize?${params.toString()}`, {});
}
