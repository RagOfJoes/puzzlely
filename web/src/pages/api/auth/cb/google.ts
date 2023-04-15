import type { NextApiRequest, NextApiResponse } from "next";
import passport from "passport";
import type { Profile } from "passport-google-oauth";

import api from "@/api";
import middleware from "@/lib/middleware";
import type { Response } from "@/types/api";
import type { Session } from "@/types/session";

async function googleCallback(
  req: NextApiRequest & {
    google?: { accessToken?: string; profile?: Profile };
  },
  res: NextApiResponse
) {
  try {
    // Check if we're already logged in
    const user = await api.me(req, res);
    if (user.success && user?.payload) {
      // If User hasn't completed account creation then redirect
      if (user.payload.user?.state !== "COMPLETE") {
        res.redirect("/profile");
        return;
      }
      res.redirect("/");
      return;
    }

    await middleware(
      req,
      res,
      passport.authenticate("google", {
        session: false,
        failureRedirect: "/",
        assignProperty: "google",
      })
    );

    const r = await fetch(`${process.env.API_URL}/auth/google`, {
      method: "POST",
      credentials: "include",
      headers: {
        // This is from passport
        Authorization: `Bearer ${req?.google?.accessToken}`,
        cookie: req.headers.cookie || "",
      },
    });
    const json: Response<Session> = await r.json();
    if (r.status !== 200 && r.status !== 201) {
      res.status(r.status).send({ success: false, error: json.error });
      return;
    }

    const cookies = r.headers.get("Set-Cookie");
    if (!cookies || !json.payload) {
      res
        .status(500)
        .send({ success: false, error: "Failed to fetch session" });
      return;
    }

    const isNewUser = r.status === 201;
    res.setHeader("Set-Cookie", cookies);
    res.redirect(isNewUser ? "/profile" : "/");
    return;
  } catch (e) {
    res.status(401).send({ success: false, error: e });
  }
}

export default googleCallback;
