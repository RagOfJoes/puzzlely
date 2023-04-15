import { z } from "zod";

import type { ColorModes } from "@/components/ColorMode";

import { COLOR_MODE_COOKIE } from "./constants";
import parseCookie from "./parseCookie";

/**
 * Retrieve valid color mode value from a cookie
 */
function getColorMode(cookie: string): ColorModes | undefined {
  const possibleColorMode = z
    .enum(["dark", "light"] as const)
    .safeParse(parseCookie(cookie, COLOR_MODE_COOKIE));
  const colorMode = (
    possibleColorMode.success ? possibleColorMode.data : "dark"
  ) satisfies ColorModes;

  return colorMode;
}

export default getColorMode;
