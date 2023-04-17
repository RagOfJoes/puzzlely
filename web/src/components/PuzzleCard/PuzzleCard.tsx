import type { ElementRef } from "react";
import { forwardRef, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import dayjs from "dayjs";
import Link from "next/link";
import { IoPlay } from "react-icons/io5";

import { LikeButton } from "@/components/LikeButton";
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from "@/lib/constants";
import omit from "@/lib/omit";
import { millisecondsTo } from "@/lib/time";

import type { PuzzleCardProps } from "./types";

export const PuzzleCard = forwardRef<
  ElementRef<typeof Primitive.div>,
  PuzzleCardProps
>((props, ref) => {
  const {
    className,
    createdAt,
    createdBy,
    difficulty,
    id,
    isEditable,
    likedAt,
    maxAttempts,
    name,
    numOfLikes,
    onLike = () => {},
    timeAllowed,
    ...other
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
    <Primitive.div
      {...other}
      ref={ref}
      className={clsx(
        "h-full w-full rounded-lg border bg-surface p-4",

        className
      )}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex w-full flex-col items-start justify-center gap-1">
          <div className="flex items-center gap-2">
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
        </div>

        <LikeButton
          isLiked={!!likedAt}
          numOfLikes={numOfLikes}
          onLike={onLike}
        />
      </div>

      <h3 className="text-md mt-2 line-clamp-1 text-ellipsis font-heading font-bold leading-normal">
        {name}
      </h3>

      <div className="mt-4 flex w-full items-center justify-between gap-2">
        <time
          dateTime={dayjs(createdAt).tz().toISOString()}
          className="line-clamp-1 w-full text-ellipsis text-xs font-semibold tracking-wide text-muted"
        >
          {dayjs(createdAt).tz().format("MMM DD, YYYY")}
        </time>

        {isEditable && (
          <Link
            rel="nofollow"
            aria-label={`Edit ${name}`}
            href={`/puzzles/update/${id}`}
            className={clsx(
              "relative flex h-8 shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-transparent px-3 text-sm font-semibold outline-none transition",

              "active:text-text/60",
              "focus-visible:ring",
              "hover:underline"
            )}
          >
            Edit
          </Link>
        )}

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
    </Primitive.div>
  );
});

PuzzleCard.displayName = "PuzzleCard";
