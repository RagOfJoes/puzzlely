import { createCookieSessionStorage } from "react-router";
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
		secrets: (process.env.SESSION_COOKIE_SECRETS ?? "").split(","),
	},
});

export const {
	dataWithError,
	dataWithInfo,
	dataWithSuccess,
	dataWithToast,
	dataWithWarning,
	getToast,
	redirectWithError,
	redirectWithInfo,
	redirectWithSuccess,
	redirectWithToast,
	redirectWithWarning,
} = createToastUtilsWithCustomSession(session);
