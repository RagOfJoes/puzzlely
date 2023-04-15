import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { Primitive } from "@radix-ui/react-primitive";
import { useInView } from "react-intersection-observer";

import { mergeRefs } from "@/hooks/useMergeRefs";

import type { WaypointProps } from "./types";

export const Waypoint = forwardRef<
  ElementRef<typeof Primitive.div>,
  WaypointProps
>((props, ref) => {
  const { ref: inViewRef } = useInView(props);

  return <div ref={mergeRefs(inViewRef, ref)} />;
});

Waypoint.displayName = "Waypoint";
