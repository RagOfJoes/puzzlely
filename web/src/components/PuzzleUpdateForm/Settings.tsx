import { useMemo } from "react";

import { PuzzleFormCard } from "@/components/PuzzleFormCard";
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from "@/lib/constants";
import { formatTime, millisecondsTo } from "@/lib/time";

import type { PuzzleUpdateFormProps } from "./types";

function Settings(props: Pick<PuzzleUpdateFormProps, "puzzle">) {
  const { puzzle } = props;

  const { minutes, seconds } = useMemo(
    () => ({
      minutes: millisecondsTo("minutes", puzzle.timeAllowed),
      seconds: millisecondsTo("seconds", puzzle.timeAllowed),
    }),
    [puzzle.timeAllowed]
  );

  return (
    <PuzzleFormCard
      caption="Fields that restricts what player's can configure about their game."
      title="Settings"
    >
      <div className="space-between flex w-full items-center gap-2">
        <div className="w-full">
          <p className="text-sm font-semibold text-subtle">Max Attempts</p>

          <p className="font-semibold">
            {puzzle.maxAttempts === UNLIMITED_MAX_ATTEMPTS
              ? "Unlimited"
              : puzzle.maxAttempts}
          </p>
        </div>

        <div className="w-full">
          <p className="text-sm font-semibold text-subtle">Time Allowed</p>

          <p className="font-semibold">
            {puzzle.timeAllowed === UNLIMITED_TIME_ALLOWED
              ? "Unlimited"
              : `${formatTime(minutes)}:${formatTime(seconds)}`}
          </p>
        </div>
      </div>
    </PuzzleFormCard>
  );
}

export default Settings;
