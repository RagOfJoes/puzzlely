import { createCookie } from "react-router";

export const history = createCookie("_h", {
	httpOnly: true,
	// 30 days
	maxAge: 2_592_000,
	path: "/",
	sameSite: "lax",
	secrets: (process.env.HISTORY_COOKIE_SECRETS ?? "").split(","),
	secure: process.env.NODE_ENV === "production",
});

export const state = createCookie("_state", {
	httpOnly: process.env.NODE_ENV === "production",
	path: "/auth/",
	sameSite: "lax",
	secrets: (process.env.STATE_COOKIE_SECRETS ?? "").split(","),
	secure: process.env.NODE_ENV === "production",
});
