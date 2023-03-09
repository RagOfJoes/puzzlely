import type { ColorModes } from "./types";

const classNames = {
  dark: "puzzlely-dark",
  light: "puzzlely-light",
};

export function query() {
  return window.matchMedia("(prefers-color-scheme: dark)");
}

export function addListener(fn: (cm: ColorModes) => unknown) {
  const q = query();
  const listener = (e: MediaQueryListEvent) => {
    fn(e.matches ? "dark" : "light");
  };

  q.addEventListener("change", listener);

  return () => {
    q.removeEventListener("change", listener);
  };
}

export function getSystemTheme() {
  return query().matches ? "dark" : "light";
}

export function preventTransition() {
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      "*{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}"
    )
  );
  document.head.appendChild(css);

  return () => {
    // force a reflow
    (() => window.getComputedStyle(document.body))();

    // wait for next tick
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.head.removeChild(css);
      });
    });
  };
}

export function setDataset(newColorMode: ColorModes) {
  const cleanup = preventTransition();

  document.documentElement.dataset.theme = newColorMode;
  document.documentElement.style.colorScheme = newColorMode;

  cleanup();
}

export function setClassName(isDark: boolean) {
  document.documentElement.classList.add(
    isDark ? classNames.dark : classNames.light
  );
  document.documentElement.classList.remove(
    isDark ? classNames.light : classNames.dark
  );
}
