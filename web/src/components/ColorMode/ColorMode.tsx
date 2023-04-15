import { ColorModeProvider } from "./Context";
import type { ColorModeProps } from "./types";
import useColorMode from "./useColorMode";

export function ColorMode(props: ColorModeProps) {
  const { children } = props;

  const ctx = useColorMode(props);

  return <ColorModeProvider value={ctx}>{children}</ColorModeProvider>;
}
