import createContext from "@/lib/createContext";

import type { UseNumberInput } from "./types";

export const [NumberInputProvider, useNumberInputCtx] =
  createContext<UseNumberInput>({
    hookName: "useNumberInputCtx",
    name: "NumberInput",
    providerName: "NumberInputProvider",
  });
