import { createCookie } from "@remix-run/node";

// TODO: Set secrets for signing
export const state = createCookie("_state", {
	// domain: process.env.HOST_URL,
	httpOnly: process.env.NODE_ENV === "production",
	path: "/auth/",
	sameSite: "lax",
	secrets: [],
	secure: process.env.NODE_ENV === "production",
});

// TODO: Set secrets for signing
export const game = createCookie("_games", {
	httpOnly: process.env.NODE_ENV === "production",
	sameSite: "lax",
	// secrets: [],
	secure: process.env.NODE_ENV === "production",
});
