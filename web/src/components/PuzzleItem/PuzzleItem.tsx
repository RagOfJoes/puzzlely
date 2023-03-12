import { forwardRef, useMemo } from "react";

import clsx from "clsx";
import Link from "next/link";
import { IoPlay } from "react-icons/io5";

import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from "@/lib/constants";
import omit from "@/lib/omit";
import { millisecondsTo } from "@/lib/time";

import type { PuzzleItemProps } from "./types";

export const PuzzleItem = forwardRef<HTMLDivElement, PuzzleItemProps>(
  (props, ref) => {
    const {
      className,
      createdBy,
      difficulty,
      id,
      maxAttempts,
      name,
      timeAllowed,
    } = omit(props, ["children"]);

    const maxAttemptsText = useMemo(() => {
      if (maxAttempts === UNLIMITED_MAX_ATTEMPTS) {
        return <>&infin; attempts</>;
      }
      return `${maxAttempts} attempt${maxAttempts! > 1 ? "s" : ""}`;
    }, [maxAttempts]);
    const timeAllowedText = useMemo(() => {
      if (timeAllowed === UNLIMITED_TIME_ALLOWED) {
        return "No Time Limit";
      }

      const minutes = millisecondsTo("minutes", timeAllowed!);
      const seconds = millisecondsTo("seconds", timeAllowed!);

      const formatMin = `${minutes} min${minutes > 1 ? "s" : ""}`;
      const formatSec = `${seconds} sec${seconds > 1 ? "s" : ""}`;
      return `${minutes > 0 ? `${formatMin} ` : ""} ${
        seconds > 0 ? formatSec : ""
      }`;
    }, [timeAllowed]);

    return (
      <div
        ref={ref}
        className={clsx(
          "h-full w-full",

          className
        )}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex w-full flex-col items-start gap-1">
            <div className="flex w-full items-center gap-2">
              <span
                className={clsx(
                  "inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold uppercase text-surface",

                  {
                    "bg-green": difficulty === "Easy",
                    "bg-yellow": difficulty === "Medium",
                    "bg-red": difficulty === "Hard",
                  }
                )}
              >
                {difficulty}
              </span>

              <Link
                href={`/users/${createdBy}`}
                className={clsx(
                  "text-sm font-bold outline-none",

                  "focus-visible:ring"
                )}
              >
                {createdBy}
              </Link>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              {maxAttemptsText} &bull; {timeAllowedText}
            </p>

            <h3 className="text-md text-ellipsis font-heading font-bold leading-normal line-clamp-1">
              {name}
            </h3>
          </div>

          <Link
            rel="nofollow"
            href={`/games/play/${id}`}
            aria-label={`Play ${name}`}
            className={clsx(
              "relative flex h-8 shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-3 text-sm font-semibold text-surface outline-none transition",

              "active:bg-cyan/70",
              "focus-visible:ring focus-visible:ring-cyan/60",
              "hover:bg-cyan/70"
            )}
          >
            Play
            <IoPlay />
          </Link>
        </div>
      </div>
    );
  }
);

PuzzleItem.displayName = "PuzzleItem";
