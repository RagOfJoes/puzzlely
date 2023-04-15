import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import useIsFirstRender from "@/hooks/useIsFirstRender";
import usePrevious from "@/hooks/usePrevious";

import type { SkeletonProps } from "./types";

export const Skeleton = forwardRef<
  ElementRef<typeof Primitive.div>,
  SkeletonProps
>((props, ref) => {
  const { children, className, isLoaded, ...other } = props;

  const isFirstRender = useIsFirstRender();
  const wasPreviouslyLoaded = usePrevious(isLoaded);

  if (isLoaded) {
    return (
      <Primitive.div
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
      </Primitive.div>
    );
  }

  return (
    <Primitive.div
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
    </Primitive.div>
  );
});

Skeleton.displayName = "Skeleton";
