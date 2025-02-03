import { createCookie } from "react-router";

export const state = createCookie("_state", {
	httpOnly: process.env.NODE_ENV === "production",
	path: "/auth/",
	sameSite: "lax",
	secrets: (process.env.STATE_COOKIE_SECRETS ?? "").split(","),
	secure: process.env.NODE_ENV === "production",
});
