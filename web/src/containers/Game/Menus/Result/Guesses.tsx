import { Fragment, useMemo } from "react";

import * as Accordion from "@radix-ui/react-accordion";
import clsx from "clsx";
import { IoChevronDown } from "react-icons/io5";

import groupBy from "@/lib/groupBy";
import type { Result } from "@/types/game";
import type { Group } from "@/types/puzzle";

import type { ResultMenuProps } from "../../types";

function Guesses(
  props: Pick<ResultMenuProps, "blocks"> &
    Pick<ResultMenuProps["game"], "puzzle" | "results">
) {
  const { blocks, puzzle, results } = props;
  const { groups } = puzzle;

  const grouped = useMemo(
    () => groupBy(blocks, (block) => block.groupID),
    [blocks]
  );
  const groupsMap = useMemo(() => {
    const map: { [groupID: string]: Group } = {};
    groups.forEach((group) => {
      if (!map[group.id]) {
        map[group.id] = group;
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const resultsMap = useMemo(() => {
    const map: Record<string, Result> = {};
    results.forEach((result) => {
      if (!map[result.groupID]) {
        map[result.groupID] = result;
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const valuesMap = useMemo(() => {
    const map: { [groupID: string]: string[] } = {};
    groups.forEach((group) => {
      if (!map[group.id]) {
        map[group.id] = group.blocks.map((b) => b.value);
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <h4 className="font-heading text-sm font-bold leading-tight">Guesses</h4>

      <div className="mt-2 flex w-full flex-col items-start justify-center gap-2">
        {grouped.map((block) => {
          const group = groupsMap[block[0]?.groupID ?? ""];

          const values = valuesMap[group?.id ?? ""];
          const result = resultsMap[group?.id ?? ""];

          if (!group || !result || !values) {
            return null;
          }

          return (
            <div key={group.id} className="w-full rounded-lg border p-4">
              <Accordion.Root
                className="w-full"
                collapsible
                defaultValue="guess"
                type="single"
              >
                <Accordion.Item value="guess">
                  <Accordion.Header>
                    <Accordion.Trigger
                      aria-label={`View blocks for ${result.guess}`}
                      className={clsx(
                        "group flex w-full items-center justify-between outline-none",

                        "focus-visible:ring"
                      )}
                    >
                      <p className="font-heading text-sm font-bold leading-tight text-subtle">
                        Blocks
                      </p>
                      <IoChevronDown
                        className={clsx(
                          "transition-transform",

                          "group-data-[state=open]:rotate-180"
                        )}
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content
                    className={clsx(
                      "overflow-hidden",

                      "data-[state=closed]:animate-accordionSlideUp",
                      "data-[state=open]:animate-accordionSlideDown"
                    )}
                  >
                    <div className="w-full pt-2">
                      {values.map((value, index) => (
                        <Fragment key={`${value}__${index}`}>
                          <p className="text-sm font-semibold">{value}</p>

                          {index !== values.length - 1 && (
                            <hr className="my-2 h-[1px] w-full bg-muted/20" />
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Accordion.Root>

              <div className="mt-2 flex w-full flex-col justify-between gap-1">
                <div className="flex w-full flex-col items-start gap-1">
                  <p className="text-sm font-semibold leading-tight text-subtle">
                    Guess
                  </p>

                  <span
                    className={clsx(
                      "inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-semibold",

                      {
                        "bg-green/20 text-green": result.correct,
                        "bg-red/20 text-red line-through": !result.correct,
                      }
                    )}
                  >
                    {result.guess}
                  </span>
                </div>

                <div className="flex w-full flex-col items-start gap-1">
                  <p className="text-sm font-semibold leading-tight text-subtle">
                    Description
                  </p>

                  <p className="text-sm font-semibold leading-tight">
                    {group.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Guesses;
