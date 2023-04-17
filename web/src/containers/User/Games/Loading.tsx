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
                attempts={0}
                challengeCode=""
                completedAt={today}
                createdBy="Lorem"
                difficulty="Medium"
                id=""
                maxAttempts={0}
                maxScore={0}
                name="Puzzle name"
                score={0}
                startedAt={today}
                timeAllowed={0}
              />
            </div>
          </Skeleton>
        );
      })}
    </>
  );
}

export default Loading;
