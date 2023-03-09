import createContext from "@/lib/createContext";

import type { UseColorMode } from "./types";

export const [ColorModeProvider, useColorModeCtx] = createContext<UseColorMode>(
  {
    hookName: "useColorModeCtx",
    name: "ColorMode",
    providerName: "ColorModeProvider",
    strict: true,
  }
);
