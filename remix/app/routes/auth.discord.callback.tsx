import querystring from "querystring";

import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import dayjs from "dayjs";

import { API } from "@/services/api.server";
import { state } from "@/services/cookies.server";
import { commitSession, getSession } from "@/services/session.server";

type TokenResponse = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
};

export async function loader({ request }: LoaderFunctionArgs) {
	// Check if user is already authenticated
	const me = await API.me(request);
	if (me.success) {
		if (me.data.user?.state !== "COMPLETE") {
			return redirect("/profile");
		}

		return redirect("/");
	}

	const session = await getSession(request.headers.get("Cookie"));

	const cookie = (await state.parse(request.headers.get("cookie"))) as null | string;
	if (!cookie) {
		const [serializedState, committedSession] = await Promise.all([
			// Remove state cookie just to be safe ;)
			state.serialize(cookie, {
				maxAge: -1,
			}),
			commitSession(session),
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

	const retrievedState = new URL(request.url).searchParams.get("state");
	if (retrievedState !== cookie) {
		const [serializedState, committedSession] = await Promise.all([
			// Remove state cookie just to be safe ;)
			state.serialize(cookie, {
				maxAge: -1,
			}),
			commitSession(session),
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

	const code = new URL(request.url).searchParams.get("code");
	const tokenRes = await fetch(`https://discord.com/api/oauth2/token`, {
		body: querystring.encode({
			client_id: process.env.DISCORD_OAUTH2_CLIENT_ID ?? "",
			client_secret: process.env.DISCORD_OAUTH2_CLIENT_SECRET ?? "",
			code,
			grant_type: "authorization_code",
			scope: "identify",
		}),
		credentials: "include",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		method: "POST",
	});
	const token: TokenResponse = await tokenRes.json();

	const auth = await API.auth(request, {
		provider: "discord",
		token: token.access_token,
	});

	if (!auth.success) {
		const [serializedState, committedSession] = await Promise.all([
			// Remove state cookie just to be safe ;)
			state.serialize(cookie, {
				maxAge: -1,
			}),
			commitSession(session),
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

	session.set("id", auth.data.id);
	session.set("state", auth.data.state);
	session.set("authenticated_at", auth.data.authenticated_at);
	session.set("created_at", auth.data.created_at);
	session.set("expires_at", auth.data.expires_at);
	session.set("user", auth.data.user);

	const [committedSession, serializedState] = await Promise.all([
		commitSession(session, {
			maxAge: dayjs(auth.data.expires_at).diff(undefined, "seconds"),
		}),
		// Remove state cookie just to be safe ;)
		state.serialize(cookie, {
			maxAge: -1,
		}),
	]);

	return redirect("/profile", {
		headers: [
			["Set-Cookie", committedSession],
			["Set-Cookie", serializedState],
		],
	});
}
