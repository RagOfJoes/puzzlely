import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import type { GameStatCardProps } from "./types";

export const GameStatCard = forwardRef<
  ElementRef<typeof Primitive.div>,
  GameStatCardProps
>((props, ref) => {
  const { body, className, icon, label, ...other } = props;

  return (
    <Primitive.div
      {...other}
      ref={ref}
      className={clsx(
        "flex w-full items-center justify-between gap-2 rounded-lg bg-surface px-3 py-4",

        className
      )}
    >
      <div className="flex flex-col items-start justify-end gap-0.5">
        <p className="text-sm font-semibold text-subtle">{label}</p>

        <p className="font-semibold leading-none">{body}</p>
      </div>

      <div
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-full bg-cyan text-surface",

          "max-md:h-10 max-md:w-10"
        )}
      >
        {icon}
      </div>
    </Primitive.div>
  );
});

GameStatCard.displayName = "GameStatCard";
