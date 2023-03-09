import createContext from "@/lib/createContext";

import type { UseFormControl } from "./types";

export const [FormControlProvider, useFormControlContext] =
  createContext<UseFormControl>({
    hookName: "useFormControlContext",
    name: "FormControl",
    providerName: "FormControlProvider",
    strict: false,
  });
