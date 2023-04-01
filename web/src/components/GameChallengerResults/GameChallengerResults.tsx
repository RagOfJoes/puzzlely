import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import Link from "next/link";

import type { GameChallengerResultsProps } from "./types";

export const GameChallengerResults = forwardRef<
  ElementRef<typeof Primitive.div>,
  GameChallengerResultsProps
>((props, ref) => {
  const { attempts, maxAttempts, maxScore, score, user } = props;

  return (
    <Primitive.div ref={ref}>
      <h4 className="font-heading text-sm font-bold leading-tight">
        Challenger&apos;s results
      </h4>

      <div className="mt-1 flex flex-col items-start justify-center gap-1">
        <div className="flex w-full items-center justify-between">
          <p className="text-sm font-semibold leading-tight text-subtle">
            Score
          </p>

          <p className="text-sm font-semibold leading-tight">
            {score}

            <small className="text-sm font-semibold leading-tight text-subtle">
              {" / "}
              {maxScore}
            </small>
          </p>
        </div>

        <div className="flex w-full items-center justify-between">
          <p className="text-sm font-semibold leading-tight text-subtle">
            Attempts
          </p>

          <p className="text-sm font-semibold leading-tight">
            {attempts}

            <small className="text-sm font-semibold leading-tight text-subtle">
              {" / "}
              {maxAttempts}
            </small>
          </p>
        </div>

        {!!user && (
          <div className="flex w-full items-center justify-between">
            <p className="text-sm font-semibold leading-tight text-subtle">
              Challenger
            </p>

            <Link
              className={clsx(
                "text-sm font-bold leading-tight outline-none",

                "focus-visible:ring"
              )}
              href={`/users/${user.username}`}
            >
              {user.username}
            </Link>
          </div>
        )}
      </div>
    </Primitive.div>
  );
});

GameChallengerResults.displayName = "GameChallengerResults";
