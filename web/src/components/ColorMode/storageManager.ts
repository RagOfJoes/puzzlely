import type { ColorModes, StorageManager } from "./types";

const path = "/";
const sameSite = "Lax";
const maxAge = "31536000";
const isProd = process.env.NODE_ENV === "production";

function parseCookie(cookie: string, key: string): ColorModes | undefined {
  const match = cookie.match(new RegExp(`(^| )${key}=([^;]+)`));

  return match?.[2] as ColorModes | undefined;
}

function storageManager(key: string, cookie?: string): StorageManager {
  return {
    get(fallback?: ColorModes): ColorModes | undefined {
      if (cookie) {
        return parseCookie(cookie, key);
      }

      if (!globalThis?.document) {
        return fallback;
      }

      return parseCookie(document.cookie, key) || fallback;
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
