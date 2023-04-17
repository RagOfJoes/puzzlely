import { useMemo } from "react";

import dayjs from "dayjs";

import { PuzzleCard } from "@/components/PuzzleCard";
import { Skeleton } from "@/components/Skeleton";
import { LOADING_DATE_PLACEHOLDER, PUZZLES_LIMIT } from "@/lib/constants";

function Loading() {
  const today = useMemo(
    () => dayjs(LOADING_DATE_PLACEHOLDER).tz().toDate(),
    []
  );

  return (
    <>
      {Array.from({ length: PUZZLES_LIMIT }).map((_, idx) => {
        return (
          <Skeleton key={`Puzzles__Loading__${idx}`}>
            <div className="invisible col-span-1 row-span-1 h-full w-full overflow-hidden">
              <PuzzleCard
                createdAt={today}
                createdBy="Lorem"
                difficulty="Easy"
                id=""
                maxAttempts={0}
                name="Lorem Ipsum"
                numOfLikes={0}
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
