import type { ParsedUrlQuery } from "querystring";

import type { GetServerSidePropsContext, PreviewData } from "next";

import type { Response } from "@/types/api";
import type { User } from "@/types/user";

/**
 * Fetches user. Will be called in server side
 */
async function findUser(
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
): Promise<Response<User>> {
  const username = ctx.query.username;
  const request = await fetch(`${process.env.API_URL}/users/${username}`, {
    method: "GET",
    credentials: "include",
    headers: {
      cookie: ctx.req.headers.cookie || "",
    },
  });

  const json: Response<User> = await request.json();
  return json;
}

export default findUser;
