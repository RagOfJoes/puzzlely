import { forwardRef } from "react";

import clsx from "clsx";

import useIsFirstRender from "@/hooks/useIsFirstRender";
import usePrevious from "@/hooks/usePrevious";

import type { SkeletonProps } from "./types";

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (props, ref) => {
    const { children, className, isLoaded, ...other } = props;

    const isFirstRender = useIsFirstRender();
    const wasPreviouslyLoaded = usePrevious(isLoaded);

    if (isLoaded) {
      return (
        <div
          {...other}
          ref={ref}
          className={clsx(
            {
              "animate-none": isFirstRender || wasPreviouslyLoaded,
              "animate-skeleton-fade": !isFirstRender && !wasPreviouslyLoaded,
            },

            className
          )}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        {...other}
        ref={ref}
        className={clsx(
          "pointer-events-none animate-skeleton cursor-default select-none rounded-md border border-surface bg-surface bg-clip-padding text-transparent opacity-60 shadow-none",

          "after:invisible",
          "before:invisible",

          className
        )}
      >
        {children}
      </div>
    );
  }
);

Skeleton.displayName = "Skeleton";
