import clsx from "clsx";
import { IoHeart, IoTime } from "react-icons/io5";

import { GameStatCard } from "@/components/GameStatCard";
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from "@/lib/constants";
import { formatTime } from "@/lib/time";

import Shortcuts from "./Shortcuts";
import type { StatsProps } from "../types";

function Stats(props: StatsProps) {
  const { game, isRunning, minutes, onForfeit, onReset, onShuffle, seconds } =
    props;
  const { attempts, config, guessedAt, startedAt } = game;

  return (
    <div
      className={clsx(
        "grid w-full grid-cols-4 gap-2 transition-opacity",

        {
          "opacity-40": (!guessedAt && !startedAt) || (!isRunning && startedAt),
          "opacity-100": guessedAt && isRunning && startedAt,
        }
      )}
    >
      <div
        className={clsx(
          "col-span-2",

          "max-md:col-span-4"
        )}
      >
        <Shortcuts
          game={game}
          onForfeit={onForfeit}
          onReset={onReset}
          onShuffle={onShuffle}
        />
      </div>

      <div
        className={clsx(
          "col-span-1 col-start-3",

          "max-md:col-span-2 max-md:col-start-1"
        )}
      >
        <GameStatCard
          label="Attempts"
          icon={<IoHeart />}
          body={
            config.maxAttempts === UNLIMITED_MAX_ATTEMPTS
              ? "Unlimited"
              : `${config.maxAttempts - attempts.length}`
          }
        />
      </div>

      <div
        className={clsx(
          "col-span-1",

          "max-md:col-span-2"
        )}
      >
        <GameStatCard
          label="Time"
          icon={<IoTime />}
          body={
            config.timeAllowed === UNLIMITED_TIME_ALLOWED
              ? "Unlimited"
              : `${formatTime(minutes)}:${formatTime(seconds)}`
          }
        />
      </div>
    </div>
  );
}

export default Stats;
