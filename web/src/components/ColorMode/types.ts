import type { ReactNode } from "react";

export type ColorModes = "light" | "dark";

export type StorageManager = {
  get(fallback?: ColorModes): ColorModes | undefined;
  set(value: ColorModes): void;
};

export type ColorModeProps = {
  children?: ReactNode;
  cookie?: string;
  defaultValue?: ColorModes | "system";
};

export type UseColorMode = {
  colorMode: ColorModes;
  setColorMode: (value: ColorModes) => void;
};
