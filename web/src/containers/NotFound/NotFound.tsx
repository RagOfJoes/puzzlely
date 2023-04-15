import clsx from "clsx";
import Link from "next/link";

export function NotFoundContainer() {
  return (
    <div className="flex w-full items-start gap-2">
      <Link
        href="/"
        className={clsx(
          "relative flex h-12 w-full shrink-0 basis-1/2 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-surface px-6 text-lg font-semibold shadow outline-none transition",

          "active:bg-muted/20",
          "focus-visible:ring",
          "hover:bg-muted/10"
        )}
      >
        Take me home
      </Link>
      <Link
        href="/puzzles"
        className={clsx(
          "relative flex h-12 w-full shrink-0 basis-1/2 select-none appearance-none items-center justify-center whitespace-nowrap rounded-md bg-surface px-6 text-lg font-semibold shadow outline-none transition",

          "active:bg-muted/20",
          "focus-visible:ring",
          "hover:bg-muted/10"
        )}
      >
        See all Puzzles
      </Link>
    </div>
  );
}
