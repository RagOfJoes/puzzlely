import { useMemo } from "react";

import clsx from "clsx";
import dayjs from "dayjs";
import { IoSkull } from "react-icons/io5";

import { GameMenuCard } from "@/components/GameMenuCard";
import { millisecondsTo } from "@/lib/time";

import type { GameOverMenuProps } from "../types";

const GameOver = (props: GameOverMenuProps) => {
  const { game, onContinue, onMenu } = props;
  const { attempts, guessedAt, score, startedAt } = game;

  const timeElapsed = useMemo(() => {
    const diff = dayjs(guessedAt)
      .tz()
      .diff(dayjs(startedAt).tz(), "milliseconds");
    const minutes = millisecondsTo("minutes", diff);
    const seconds = millisecondsTo("seconds", diff);

    const formatMin = `${minutes > 9 ? "" : 0}${minutes}`;
    const formatSec = `${seconds > 9 ? "" : 0}${seconds}`;
    return `${formatMin}:${formatSec}`;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GameMenuCard>
      <div className="flex w-full items-center justify-between gap-6">
        <div className="flex w-full flex-col items-start justify-center">
          <p className="text-sm font-bold outline-none">Score: {score}</p>

          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Failed Attempts: {attempts.length}
          </p>
        </div>

        <IoSkull className="h-5 w-5" />
      </div>

      <h3 className="mt-2 line-clamp-1 text-ellipsis font-heading font-bold leading-normal">
        Game Over!
      </h3>

      <p className="line-clamp-1 w-full text-ellipsis text-xs font-semibold tracking-wide text-subtle">
        Elapsed: {timeElapsed}
      </p>

      <div className="mt-4 flex w-full items-center justify-center gap-2">
        <button
          aria-label="Update game settings"
          className={clsx(
            "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 font-semibold outline-none transition",

            "active:bg-muted/20",
            "focus-visible:ring",
            "hover:bg-muted/10"
          )}
          onClick={onMenu}
        >
          Menu
        </button>

        <button
          aria-label="Start game"
          className={clsx(
            "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

            "active:bg-cyan/70",
            "focus-visible:ring focus-visible:ring-cyan/60",
            "hover:bg-cyan/70"
          )}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </GameMenuCard>
  );
};

export default GameOver;
