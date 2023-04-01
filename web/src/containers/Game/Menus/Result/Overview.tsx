import { useMemo } from "react";

import dayjs from "dayjs";

import type { ResultMenuProps } from "../../types";

function Overview(
  props: Pick<
    ResultMenuProps["game"],
    "completedAt" | "puzzle" | "score" | "startedAt"
  >
) {
  const { completedAt, puzzle, score, startedAt } = props;
  const { groups } = puzzle;

  const timeElapsed = useMemo(() => {
    const diff = dayjs.duration(
      dayjs(completedAt).tz().diff(dayjs(startedAt).tz())
    );
    return diff.format("HH:mm:ss");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <h4 className="font-heading text-sm font-bold leading-tight">Overview</h4>

      <div className="mt-1 flex w-full flex-col items-start justify-center gap-1">
        <div className="flex w-full items-center justify-between">
          <p className="text-sm font-semibold leading-tight text-subtle">
            Score
          </p>

          <p className="text-sm font-semibold leading-tight">
            {score}

            <small className="text-sm font-semibold leading-tight text-subtle">
              {" / "}
              {groups.length * 2}
            </small>
          </p>
        </div>

        <div className="flex w-full items-center justify-between">
          <p className="text-sm font-semibold leading-tight text-subtle">
            Total Time
          </p>

          <p className="text-sm font-semibold leading-tight">{timeElapsed}</p>
        </div>
      </div>
    </div>
  );
}

export default Overview;
