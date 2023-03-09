import clsx from "clsx";
import Link from "next/link";
import { IoMenu } from "react-icons/io5";

import { Search } from "./Search";
import { Settings } from "./Settings";
import type { TopbarProps } from "./types";

export function Topbar(props: TopbarProps) {
  const { links, isOpen, toggleIsOpen } = props;

  return (
    <header className="z-[1] flex w-full items-center justify-between p-5 pt-3">
      <button
        onClick={() => toggleIsOpen(!isOpen)}
        aria-label={
          isOpen ? "Close Side Navigation Bar" : "Open Side Navigation Bar"
        }
        className={clsx(
          "mr-2 hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-transparent bg-surface text-subtle outline-none transition",

          "dark:border-inherit",
          "focus:ring",
          "hover:bg-muted/10",
          "max-lg:flex"
        )}
      >
        <IoMenu />
      </button>

      <nav aria-label="breadcrumb">
        <ol
          className={clsx(
            "flex items-center",

            "max-lg:hidden"
          )}
        >
          {links.map((link, i) => {
            const { path, title } = link;

            const isLast = i === links.length - 1;

            return (
              <li
                key={path}
                className={clsx(
                  "inline-flex items-center justify-center rounded-md font-medium text-subtle outline-none",

                  "focus-within:ring"
                )}
              >
                <Link
                  href={path}
                  rel="nofollow"
                  className={clsx(
                    "outline-none",

                    "hover:underline"
                  )}
                  aria-current={isLast && "page"}
                >
                  {title}
                </Link>

                {!isLast && (
                  <p role="presentation" className="mx-2">
                    /
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex gap-2">
        <Search />
        <Settings />
      </div>
    </header>
  );
}
