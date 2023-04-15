import type { NextApiRequest, NextApiResponse } from "next";

import api from "@/api";

async function logout(req: NextApiRequest, res: NextApiResponse) {
  // Check if we're logged in
  const user = await api.me(req, res);
  if (!user.success || !user?.payload) {
    res.redirect("/login");
    return;
  }

  try {
    const r = await fetch(`${process.env.API_URL}/logout`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        cookie: req.headers.cookie || "",
      },
    });
    if (r.status !== 200) {
      res.status(500).send({
        success: false,
        error: { code: "Internal", message: "Failed to destroy session" },
      });
      return;
    }
    const cookies = r.headers.get("Set-Cookie");
    if (cookies) {
      res.setHeader("Set-Cookie", cookies);
    }
    res.redirect("/");
  } catch (e) {
    res.status(500).send({ success: false, error: e });
  }
}

export default logout;
