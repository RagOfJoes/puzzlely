import { useMemo } from "react";

import clsx from "clsx";
import dayjs from "dayjs";
import Link from "next/link";

import { GameChallengerResults } from "@/components/GameChallengerResults";
import { GameMenuCard } from "@/components/GameMenuCard";
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from "@/lib/constants";
import { millisecondsTo } from "@/lib/time";

import type { MainMenuProps } from "../types";

function MainMenu(props: MainMenuProps) {
  const { game, onConfig, onStart } = props;
  const { config, challengedBy, puzzle } = game;
  const { maxAttempts, timeAllowed } = config;
  const { createdAt, createdBy, difficulty, groups, name } = puzzle;

  const maxAttemptsText = useMemo(() => {
    if (maxAttempts === UNLIMITED_MAX_ATTEMPTS) {
      return "Unlimited Attempts";
    }
    return `${maxAttempts} attempt${maxAttempts! > 1 ? "s" : ""}`;
  }, [maxAttempts]);
  const timeAllowedText = useMemo(() => {
    if (timeAllowed === UNLIMITED_TIME_ALLOWED) return "No Time Limit";

    const minutes = millisecondsTo("minutes", timeAllowed!);
    const seconds = millisecondsTo("seconds", timeAllowed!);

    const formatMin = `${minutes} min${minutes > 1 ? "s" : ""}`;
    const formatSec = `${seconds} sec${seconds > 1 ? "s" : ""}`;
    return `${minutes > 0 ? `${formatMin} ` : ""} ${
      seconds > 0 ? formatSec : ""
    }`;
  }, [timeAllowed]);

  return (
    <GameMenuCard>
      <div className="flex w-full items-center justify-between gap-6">
        <div className="flex w-full flex-col items-start justify-center gap-0">
          <Link
            className={clsx(
              "text-sm font-bold outline-none",

              "focus-visible:ring"
            )}
            href={`/users/${createdBy.username}`}
          >
            {createdBy.username}
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

      <h3 className="mt-2 line-clamp-1 text-ellipsis font-heading font-bold leading-normal">
        {name}
      </h3>

      <time
        className="line-clamp-1 w-full text-ellipsis text-xs font-semibold tracking-wide text-subtle"
        dateTime={dayjs(createdAt).tz().toISOString()}
      >
        Created at: {dayjs(createdAt).tz().format("MMM DD, YYYY")}
      </time>

      {!!challengedBy && (
        <>
          <hr className="my-2 h-[1px] w-full bg-muted/20" />

          <GameChallengerResults
            attempts={challengedBy.attempts}
            maxAttempts={config.maxAttempts}
            maxScore={groups.length * 2}
            score={challengedBy.score}
            user={challengedBy.user}
          />
        </>
      )}

      <div className="mt-4 flex w-full items-center justify-center gap-2">
        <button
          aria-label="Update game settings"
          className={clsx(
            "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 font-semibold outline-none transition",

            "active:bg-muted/20",
            "focus-visible:ring",
            "hover:bg-muted/10"
          )}
          onClick={onConfig}
        >
          Settings
        </button>

        <button
          aria-label="Start game"
          className={clsx(
            "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

            "active:bg-cyan/70",
            "focus-visible:ring focus-visible:ring-cyan/60",
            "hover:bg-cyan/70"
          )}
          onClick={onStart}
        >
          Start
        </button>
      </div>
    </GameMenuCard>
  );
}

export default MainMenu;
