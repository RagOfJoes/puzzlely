import type { ElementRef } from "react";
import { Children, forwardRef, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import type { GameGridProps } from "./types";

export const GameGrid = forwardRef<
  ElementRef<typeof Primitive.div>,
  GameGridProps
>((props, ref) => {
  const { children, className, ...other } = props;

  const filtered = useMemo(() => {
    return Children.toArray(children).filter((child: any) => {
      return (
        child?.type?.displayName === "GameGridBlock" ||
        child?.type?.displayName === "GameGridOverlay"
      );
    });
  }, [children]);

  return (
    <Primitive.div
      {...other}
      ref={ref}
      className={clsx(
        "relative grid w-full grid-cols-4 grid-rows-4 gap-2 rounded-lg",

        'before:col-start-1 before:col-end-1 before:row-start-1 before:row-end-1 before:w-0 before:pb-[100%] before:content-[""]',

        className
      )}
    >
      {filtered}
    </Primitive.div>
  );
});

GameGrid.displayName = "GameGrid";
