import { createCookieSessionStorage } from "@remix-run/node";

import type { Session } from "@/types/session";

export const { commitSession, destroySession, getSession } = createCookieSessionStorage<
	Session,
	{ error: string }
>({
	// a Cookie from `createCookie` or the CookieOptions to create one
	cookie: {
		name: "_session",

		// Optional
		//

		httpOnly: true,
		path: "/",
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		secrets:
			process.env.NODE_ENV === "production" ? [process.env.SESSION_SECRET ?? ""] : ["SECRETS"],
	},
});
