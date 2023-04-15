import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";

import type { PuzzleFormCardProps } from "./types";

export const PuzzleFormCard = forwardRef<
  ElementRef<typeof Primitive.div>,
  PuzzleFormCardProps
>((props, ref) => {
  const {
    caption,
    children,
    className,
    hideDivider = false,
    title,
    ...other
  } = props;

  return (
    <Primitive.div
      {...other}
      ref={ref}
      className={clsx(
        "rounded-lg bg-surface p-4 shadow",

        className
      )}
    >
      {title && <h3 className="font-heading text-xl font-bold">{title}</h3>}

      {caption && <p className="text-sm font-medium text-subtle">{caption}</p>}

      {!hideDivider && <hr className="mb-4 mt-2 h-[1px] w-full bg-muted/20" />}

      {children}
    </Primitive.div>
  );
});

PuzzleFormCard.displayName = "PuzzleFormCard";
