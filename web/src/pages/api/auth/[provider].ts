import type { NextApiRequest, NextApiResponse } from "next";
import type { AuthenticateOptions } from "passport";
import passport from "passport";
import { Strategy as DiscordOAuth2Strategy } from "passport-discord";
import { Strategy as GitHubOAuth2Strategy } from "passport-github";
import { OAuth2Strategy as GoogleOAuth2Strategy } from "passport-google-oauth";

import api from "@/api";
import { SUPPORTED_PROVIDERS } from "@/lib/constants";

passport.use(
  new DiscordOAuth2Strategy(
    {
      clientID: process.env.DISCORD_OAUTH2_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_OAUTH2_CLIENT_SECRET ?? "",
      callbackURL: process.env.DISCORD_OAUTH2_REDIRECT_URL ?? "",
    },
    (accessToken, _, profile, cb) => {
      return cb(null, { accessToken, profile });
    }
  )
);
passport.use(
  new GitHubOAuth2Strategy(
    {
      clientID: process.env.GITHUB_OAUTH2_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_OAUTH2_CLIENT_SECRET ?? "",
      callbackURL: process.env.GITHUB_OAUTH2_REDIRECT_URL ?? "",
    },
    (accessToken, _, profile, cb) => {
      return cb(null, { accessToken, profile });
    }
  )
);
passport.use(
  new GoogleOAuth2Strategy(
    {
      clientID: process.env.GOOGLE_OAUTH2_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_OAUTH2_CLIENT_SECRET ?? "",
      callbackURL: process.env.GOOGLE_OAUTH2_REDIRECT_URL ?? "",
    },
    (accessToken, _, profile, cb) => {
      return cb(null, { accessToken, profile });
    }
  )
);

async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Validate provider
  const { provider } = req.query;
  if (typeof provider !== "string") {
    res.status(400).send({
      success: false,
      error: "Invalid OAuth2 provider.",
    });
    return;
  }
  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    res.status(400).send({
      success: false,
      error: `${provider} is not a supported OAuth2 provider.`,
    });
    return;
  }

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

  try {
    const opts: AuthenticateOptions = {
      session: false,
    };

    // eslint-disable-next-line default-case
    switch (provider) {
      case "discord":
        opts.prompt = "none";
        opts.scope = ["identify"];
        break;
      case "github":
        opts.scope = ["read:user"];
        break;
      case "google":
        opts.scope = ["profile"];
        break;
    }

    await passport.authenticate(provider, opts)(req, res);
  } catch (e) {
    res.status(500).send({
      success: false,
      error: `Failed to authenticate with ${provider}. Please try again later.`,
    });
  }
}

export default auth;
