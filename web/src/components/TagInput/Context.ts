import createContext from "@/lib/createContext";

import type { UseTagInput } from "./types";

export const [TagInputProvider, useTagInputCtx] = createContext<UseTagInput>({
  hookName: "useTagInputCtx",
  name: "TagInputContext",
  providerName: "TagInputProvider",
});
