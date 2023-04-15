import clsx from "clsx";
import Link from "next/link";

import { NotFoundIcon } from "@/components/NotFoundIcon";

import type { PuzzleUpdateErrorContainerProps } from "./types";

export function PuzzleUpdateErrorContainer(
  props: PuzzleUpdateErrorContainerProps
) {
  const { error } = props;

  return (
    <article className="mx-auto w-full max-w-xl">
      <div className="flex flex-col gap-4">
        <NotFoundIcon className="h-auto max-h-64 w-full" />

        <div className="my-auto flex w-full flex-col justify-center gap-0.5">
          <h2 className="font-heading text-xl font-bold leading-none">
            {error.code}...
          </h2>
          <p className="font-medium leading-none text-subtle">
            {error.message}
          </p>
        </div>

        <div className="flex w-full items-start gap-2">
          <Link
            href="/puzzles"
            className={clsx(
              "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border px-4 font-semibold outline-none transition",

              "active:bg-muted/20",
              "focus-visible:ring",
              "hover:bg-muted/10"
            )}
          >
            See all Puzzles
          </Link>

          <Link
            href="/"
            className={clsx(
              "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

              "active:bg-cyan/70",
              "focus-visible:ring focus-visible:ring-cyan/60",
              "hover:bg-cyan/70"
            )}
          >
            Take me home
          </Link>
        </div>
      </div>
    </article>
  );
}
