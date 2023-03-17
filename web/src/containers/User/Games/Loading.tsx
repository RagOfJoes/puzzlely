import { useMemo } from "react";

import dayjs from "dayjs";

import { GameCard } from "@/components/GameCard";
import { Skeleton } from "@/components/Skeleton";
import { GAMES_LIMIT, LOADING_DATE_PLACEHOLDER } from "@/lib/constants";

function Loading() {
  const today = useMemo(
    () => dayjs(LOADING_DATE_PLACEHOLDER).tz().toDate(),
    []
  );

  return (
    <>
      {Array.from({ length: GAMES_LIMIT }).map((_, idx) => {
        return (
          <Skeleton key={`Games__Loading__${idx}`}>
            <div className="invisible col-span-1 row-span-1 h-full w-full overflow-hidden">
              <GameCard
                id=""
                score={0}
                attempts={0}
                maxScore={0}
                timeAllowed={0}
                maxAttempts={0}
                challengeCode=""
                createdBy="Lorem"
                startedAt={today}
                name="Puzzle name"
                completedAt={today}
                difficulty="Medium"
              />
            </div>
          </Skeleton>
        );
      })}
    </>
  );
}

export default Loading;
