import { createCookie } from "react-router";

// TODO: Set secrets for signing
export const state = createCookie("_state", {
	// domain: process.env.HOST_URL,
	httpOnly: process.env.NODE_ENV === "production",
	path: "/auth/",
	sameSite: "lax",
	secrets: [],
	secure: process.env.NODE_ENV === "production",
});
