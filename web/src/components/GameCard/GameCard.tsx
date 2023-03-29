import type { ElementRef } from "react";
import { forwardRef, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import dayjs from "dayjs";
import Link from "next/link";
import { IoCheckbox, IoPlay, IoReader, IoRocket } from "react-icons/io5";

import useClipboard from "@/hooks/useClipboard";
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from "@/lib/constants";
import { millisecondsTo } from "@/lib/time";

import type { GameCardProps } from "./types";

export const GameCard = forwardRef<
  ElementRef<typeof Primitive.div>,
  GameCardProps
>((props, ref) => {
  const {
    attempts,
    completedAt,
    createdBy,
    difficulty,
    challengeCode,
    id,
    isPlayable,
    maxAttempts,
    maxScore,
    name,
    score,
    startedAt,
    timeAllowed,
  } = props;

  const { hasCopied, onCopy } = useClipboard(
    `${process.env.NEXT_PUBLIC_HOST_URL}/games/challenge/${challengeCode}`,
    3000
  );

  const maxAttemptsText = useMemo(() => {
    if (maxAttempts === UNLIMITED_MAX_ATTEMPTS) {
      return "Unlimited Attempts";
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
  const timeElapsed = useMemo(() => {
    const diff = dayjs.duration(
      dayjs(completedAt).tz().diff(dayjs(startedAt).tz())
    );
    return diff;
  }, [completedAt, startedAt]);

  return (
    <Primitive.div ref={ref} className="rounded-lg bg-surface p-4">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex flex-col items-start gap-0">
          <Link
            href={`/users/${createdBy}/`}
            className={clsx(
              "text-sm font-bold outline-none",

              "focus-visible:ring"
            )}
          >
            {createdBy}
          </Link>

          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            {maxAttemptsText} &bull; {timeAllowedText}
          </p>
        </div>

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
      </div>

      <h3 className="text-md mt-2 line-clamp-1 text-ellipsis font-heading font-bold leading-normal">
        {name}
      </h3>

      <div className="mt-2 flex flex-col items-start justify-center gap-1">
        <div className="flex w-full items-center justify-between">
          <p className="text-xs font-semibold text-subtle">Score</p>

          <p className="text-xs font-semibold">
            {score}

            <small className="text-xs font-semibold text-subtle">
              {" / "}
              {maxScore}
            </small>
          </p>
        </div>

        <div className="flex w-full items-center justify-between">
          <p className="text-xs font-semibold text-subtle">Attempts</p>

          <p className="text-xs font-semibold">
            {attempts}

            <small className="text-xs font-semibold text-subtle">
              {" / "}
              {maxAttempts}
            </small>
          </p>
        </div>

        <div className="flex w-full items-center justify-between">
          <p className="text-xs font-semibold text-subtle">Total Time</p>

          <time
            className="text-xs font-semibold"
            dateTime={timeElapsed.toISOString()}
          >
            {timeElapsed.format("HH:mm:ss")}
          </time>
        </div>
      </div>

      <div className="mt-4 flex w-full justify-end gap-2">
        {isPlayable ? (
          <>
            <Link
              rel="nofollow"
              href={`/games/challenge/${challengeCode}`}
              className={clsx(
                "relative flex h-8 w-full shrink-0 basis-1/2 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 text-sm font-semibold outline-none transition",

                "focus-visible:ring",
                "hover:bg-muted/10"
              )}
            >
              <IoRocket />
              Challenge
            </Link>

            <Link
              rel="nofollow"
              href={`/games/play/${id}`}
              aria-label={`Play ${name}`}
              className={clsx(
                "relative flex h-8 w-full shrink-0 basis-1/2 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-3 text-sm font-semibold text-surface outline-none transition",

                "active:bg-cyan/70",
                "focus-visible:ring focus-visible:ring-cyan/60",
                "hover:bg-cyan/70"
              )}
            >
              Play
              <IoPlay />
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={() => onCopy()}
              className={clsx(
                "relative flex h-8 w-full shrink-0 basis-1/2 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border px-3 text-sm font-semibold outline-none transition",

                "focus-visible:ring",
                "hover:bg-muted/10"
              )}
            >
              {hasCopied ? <IoCheckbox /> : <IoRocket />}
              {hasCopied ? "Copied!" : "Challenge"}
            </button>

            <Link
              rel="nofollow"
              href={`/games/${id}`}
              aria-label={`View ${name}`}
              className={clsx(
                "relative flex h-8 w-full shrink-0 basis-1/2 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-3 text-sm font-semibold text-surface outline-none transition",

                "active:bg-cyan/70",
                "focus-visible:ring focus-visible:ring-cyan/60",
                "hover:bg-cyan/70"
              )}
            >
              View
              <IoReader />
            </Link>
          </>
        )}
      </div>
    </Primitive.div>
  );
});

GameCard.displayName = "GameCard";
