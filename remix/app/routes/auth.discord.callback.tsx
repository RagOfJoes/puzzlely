import querystring from "querystring";

import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

import { API } from "@/services/api.server";
import { state } from "@/services/cookies.server";

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
	if (me.success && me.payload) {
		const session = me.payload;
		if (session.user?.state !== "COMPLETE") {
			return redirect("/profile");
		}

		return redirect("/");
	}

	const cookie = (await state.parse(request.headers.get("cookie"))) as null | string;
	if (!cookie) {
		return redirect("/login", {
			headers: {
				// Remove state cookie just to be safe ;)
				"Set-Cookie": await state.serialize(cookie, {
					maxAge: -1,
				}),
			},
			status: 400,
			statusText: "Failed to retrieve state.",
		});
	}

	const retrievedState = new URL(request.url).searchParams.get("state");
	if (retrievedState !== cookie) {
		return redirect("/login", {
			headers: {
				// Remove state cookie
				"Set-Cookie": await state.serialize(cookie, {
					maxAge: -1,
				}),
			},
			status: 400,
			statusText: "Invalid state.",
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

	const headers = new Headers();
	// Set the session cookie from API
	headers.append("Set-Cookie", auth.cookie);
	// Remove state cookie
	headers.append(
		"Set-Cookie",
		await state.serialize(cookie, {
			maxAge: -1,
		}),
	);
	return redirect("/login", {
		headers,
	});
}
