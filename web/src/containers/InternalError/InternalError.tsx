import clsx from "clsx";
import Link from "next/link";

export function InternalErrorContainer() {
  return (
    <div className="flex w-full items-start gap-2">
      <Link
        className={clsx(
          "relative flex h-12 w-full shrink-0 basis-1/2 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md border bg-surface px-6 text-lg font-semibold shadow outline-none transition",

          "active:bg-muted/20",
          "focus-visible:ring",
          "hover:bg-muted/10"
        )}
        href="/"
      >
        Take me home
      </Link>
      <Link
        className={clsx(
          "relative flex h-12 w-full shrink-0 basis-1/2 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md border bg-surface px-6 text-lg font-semibold shadow outline-none transition",

          "active:bg-muted/20",
          "focus-visible:ring",
          "hover:bg-muted/10"
        )}
        href="/puzzles"
      >
        See all Puzzles
      </Link>
    </div>
  );
}
