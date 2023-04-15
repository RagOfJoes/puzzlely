import type { NextApiRequestCookies } from "next/dist/server/api-utils";

import { COLOR_MODE_COOKIE } from "./constants";

function getColorModeCookie(cookies: NextApiRequestCookies) {
  if (typeof window !== "undefined") {
    return "";
  }

  return `${COLOR_MODE_COOKIE}=${cookies[COLOR_MODE_COOKIE] ?? ""}`;
}

export default getColorModeCookie;
