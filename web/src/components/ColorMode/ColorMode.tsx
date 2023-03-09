import { ColorModeProvider } from "./Context";
import type { ColorModeProps } from "./types";
import useColorMode from "./useColorMode";

export function ColorMode(props: ColorModeProps) {
  const { children } = props;

  const ctx = useColorMode(props);

  return (
    <ColorModeProvider value={ctx}>
      {ctx.colorMode === "dark" ? (
        <style global jsx>
          {`
            :root {
              color-scheme: dark;

              --color-base: 249deg 22% 12%;
              --color-overlay: 248deg 25% 18%;
              --color-surface: 247deg 23% 15%;

              --color-muted: 249deg 12% 47%;
              --color-subtle: 248deg 15% 61%;
              --color-text: 245deg 50% 91%;

              --color-blue: 189deg 43% 73%;
              --color-cyan: 2deg 55% 83%;
              --color-green: 197deg 49% 38%;
              --color-magenta: 267deg 57% 78%;
              --color-red: 343deg 76% 68%;
              --color-yellow: 35deg 88% 72%;
            }
          `}
        </style>
      ) : (
        <style global jsx>
          {`
            :root {
              color-scheme: light;

              --color-base: 32deg 57% 95%;
              --color-overlay: 33deg 43% 91%;
              --color-surface: 35deg 100% 98%;

              --color-muted: 257deg 9% 61%;
              --color-subtle: 248deg 12% 52%;
              --color-text: 248deg 19% 40%;

              --color-blue: 189deg 30% 48%;
              --color-cyan: 3deg 53% 67%;
              --color-green: 197deg 53% 34%;
              --color-magenta: 268deg 21% 57%;
              --color-red: 343deg 35% 55%;
              --color-yellow: 35deg 81% 56%;
            }
          `}
        </style>
      )}

      {children}
    </ColorModeProvider>
  );
}
