import { createCookieSessionStorage } from "@remix-run/node";
import { createToastUtilsWithCustomSession } from "remix-toast";

const session = createCookieSessionStorage({
	cookie: {
		name: "_t",

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

export const {
	getToast,
	jsonWithError,
	jsonWithInfo,
	jsonWithSuccess,
	jsonWithToast,
	jsonWithWarning,
	redirectWithError,
	redirectWithInfo,
	redirectWithSuccess,
	redirectWithToast,
	redirectWithWarning,
} = createToastUtilsWithCustomSession(session);
