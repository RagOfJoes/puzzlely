import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";

import type { GameGridOverlayProps } from "./types";

export const GameGridOverlay = forwardRef<
  ElementRef<typeof Primitive.div>,
  GameGridOverlayProps
>((props, ref) => {
  return <Primitive.div {...props} ref={ref} />;
});

GameGridOverlay.displayName = "GameGridOverlay";
