import { createCookieSessionStorage } from "react-router";

import type { Session } from "@/types/session";

export const { commitSession, destroySession, getSession } = createCookieSessionStorage<Session>({
	// a Cookie from `createCookie` or the CookieOptions to create one
	cookie: {
		name: "_s",

		// Optional
		//

		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secrets: (process.env.SESSION_COOKIE_SECRETS ?? "").split(","),
		secure: process.env.NODE_ENV === "production",
	},
});
