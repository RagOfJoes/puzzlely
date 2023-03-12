import type { ComponentProps } from "react";

export type SkeletonProps = ComponentProps<"div"> & {
  isLoaded?: boolean;
};
