import { useCallback, useEffect, useMemo, useState } from "react";

import { COLOR_MODE_COOKIE } from "@/lib/constants";

import storageManager from "./storageManager";
import type {
  ColorModes,
  ColorModeProps,
  StorageManager,
  UseColorMode,
} from "./types";
import { addListener, setClassName, setDataset } from "./utils";

function getTheme(
  manager: StorageManager,
  fallback?: ColorModes
): ColorModes | undefined {
  return manager.get(fallback);
}

function useColorMode(props: ColorModeProps): UseColorMode {
  const { cookie, defaultValue = "dark" } = props;

  const manager = useMemo(() => {
    return storageManager(COLOR_MODE_COOKIE, cookie);
  }, [cookie]);

  const [colorMode, rawSetColorMode] = useState(() =>
    getTheme(manager, "dark")
  );

  const setColorMode = useCallback(
    (newColorMode: ColorModes) => {
      rawSetColorMode(newColorMode);

      setClassName(newColorMode === "dark");
      setDataset(newColorMode);

      manager.set(newColorMode);
    },
    [manager]
  );

  useEffect(() => {
    const managerValue = manager.get();

    if (managerValue) {
      setColorMode(managerValue);
      return;
    }

    setColorMode("light");
  }, [manager, defaultValue, setColorMode]);

  useEffect(() => {
    return addListener(setColorMode);
  }, [setColorMode]);

  const context = useMemo(
    () => ({
      colorMode: colorMode ?? "dark",
      setColorMode,
    }),
    [colorMode, setColorMode]
  );

  return context;
}

export default useColorMode;
