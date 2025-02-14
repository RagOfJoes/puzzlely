import crypto from "crypto";

import { redirect } from "react-router";

import { API } from "@/services/api.server";
import { state } from "@/services/cookies.server";
import { commitSession, getSession } from "@/services/session.server";
import { redirectWithError } from "@/services/toast.server";

import type { Route } from "./+types/google";

export async function action({ request }: Route.ActionArgs) {
	// Check if user is already authenticated
	const me = await API.me(request);
	if (me.success && me.data.user) {
		return me.data.user.state === "COMPLETE" ? redirect("/") : redirect("/profile");
	}

	const session = await getSession(request.headers.get("Cookie"));

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

		return redirect("/auth/google", {
			headers: [
				["Set-Cookie", committedSession],
				["Set-Cookie", serializedState],
			],
		});
	}

	const params = new URLSearchParams({
		client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID ?? "",
		client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET ?? "",
		prompt: "select_account",
		redirect_uri: `${process.env.VITE_HOST_URL}/auth/google/callback`,
		response_type: "code",
		scope: "profile",
		state: cookie,
	});
	return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function loader({ request }: Route.LoaderArgs) {
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

		return redirectWithError(
			"/login",
			{
				description: "Please try again later.",
				message: "Failed to login with Google!",
			},
			{
				headers: [
					["Set-Cookie", committedSession],
					["Set-Cookie", serializedState],
				],
			},
		);
	}

	const params = new URLSearchParams({
		client_id: process.env.GOOGLE_OAUTH2_CLIENT_ID ?? "",
		client_secret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET ?? "",
		prompt: "select_account",
		redirect_uri: `${process.env.VITE_HOST_URL}/auth/google/callback`,
		response_type: "code",
		scope: "profile",
		state: cookie,
	});
	return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
