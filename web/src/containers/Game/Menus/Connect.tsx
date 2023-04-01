import { Fragment, useMemo, useState } from "react";

import clsx from "clsx";
import { IoGrid } from "react-icons/io5";

import { FormControl, FormControlLabel } from "@/components/FormControl";
import { GameMenuCard } from "@/components/GameMenuCard";
import { Input } from "@/components/Input";
import type { UseGameConnectConnection } from "@/hooks/useGameConnect";
import groupBy from "@/lib/groupBy";

import type { ConnectMenuProps } from "../types";

const Connect = (props: ConnectMenuProps) => {
  const { blocks, game, onConnect } = props;
  const { attempts, completedAt, puzzle, score } = game;

  const [connected, setConnected] = useState<UseGameConnectConnection>(() => {
    const init: UseGameConnectConnection = {};
    puzzle.groups.forEach((group) => {
      init[group.id] = { guess: "" };
    });
    return init;
  });

  const grouped = useMemo(
    () => groupBy(blocks, (block) => block.groupID),
    [blocks]
  );
  const connectedAll = useMemo(() => {
    if (game.completedAt) {
      return true;
    }

    const keys = Object.keys(connected);
    return (
      keys
        .map((key) => connected[key]?.guess || "")
        .filter((guess) => guess.trim().length === 0).length === 0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  return (
    <GameMenuCard>
      <div className="flex w-full items-center justify-between gap-6">
        <div className="flex w-full flex-col items-start justify-center">
          <p className="text-sm font-bold outline-none">Score: {score}</p>

          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Failed Attempts: {attempts.length}
          </p>
        </div>

        <IoGrid className="h-5 w-5" />
      </div>

      <h3 className="mt-2 line-clamp-1 text-ellipsis font-heading font-bold leading-normal">
        Guess Connections
      </h3>

      <div className="mt-4 flex flex-col items-center justify-center gap-4">
        {grouped.map((block, i) => {
          const groupID = block[0]?.groupID;
          const values = block.map((b) => b.value);

          if (!groupID) {
            return null;
          }

          return (
            <div key={groupID} className="w-full">
              <FormControl>
                <FormControlLabel>
                  <div className="flex flex-col">
                    {values.map((value, index) => (
                      <Fragment key={`${groupID}-${value}`}>
                        <p className="text-sm font-semibold">{value}</p>

                        {index !== values.length - 1 && (
                          <hr className="my-2 h-[1px] w-full bg-muted/20" />
                        )}
                      </Fragment>
                    ))}
                  </div>
                </FormControlLabel>

                <Input
                  autoFocus={i === 0}
                  onChange={(e) => {
                    setConnected((prev) => ({
                      ...prev,
                      [groupID]: {
                        guess: e.target.value,
                      },
                    }));
                  }}
                  placeholder="Answer here"
                  value={connected[groupID]?.guess || ""}
                />
              </FormControl>
            </div>
          );
        })}
      </div>

      <button
        aria-label="Submit guesses"
        className={clsx(
          "relative mt-4 flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

          "active:enabled:bg-cyan/70",
          "disabled:cursor-not-allowed disabled:bg-cyan/40",
          "focus-visible:enabled:ring focus-visible:enabled:ring-cyan/60",
          "hover:enabled:bg-cyan/70"
        )}
        disabled={!!completedAt || !connectedAll}
        onClick={() => onConnect(connected)}
      >
        Submit
      </button>
    </GameMenuCard>
  );
};

export default Connect;
