import { z } from "zod";

import parseCookie from "@/lib/parseCookie";

import type { ColorModes, StorageManager } from "./types";

const path = "/";
const sameSite = "Lax";
const maxAge = "31536000";
const isProd = process.env.NODE_ENV === "production";

function storageManager(key: string, cookie?: string): StorageManager {
  return {
    get(fallback): ColorModes | undefined {
      if (cookie) {
        const colorMode = z
          .enum(["dark", "light"] as const)
          .safeParse(parseCookie(cookie, key));

        return colorMode.success ? colorMode.data : undefined;
      }

      if (!globalThis?.document) {
        return fallback;
      }

      const colorMode = z
        .enum(["dark", "light"] as const)
        .safeParse(parseCookie(document.cookie, key));

      return colorMode.success ? colorMode.data : undefined;
    },
    set(value) {
      if (typeof window === "undefined") {
        return;
      }

      const newCookie = `${key}=${value}; Path=${path}; SameSite=${sameSite}; Max-Age=${maxAge}${
        isProd ? "; Secure" : ""
      }`;

      document.cookie = newCookie;
    },
  };
}

export default storageManager;
