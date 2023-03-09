import { forwardRef } from "react";

import clsx from "clsx";
import Link from "next/link";
import { IoAdd } from "react-icons/io5";

import { PuzzlelyIcon } from "@/components/PuzzlelyIcon";
import { Separator } from "@/components/Separator";

import type { SidebarProps } from "./types";

export const Sidebar = forwardRef<HTMLElement, SidebarProps>((props, ref) => {
  const { children, isOpen } = props;

  return (
    <nav
      ref={ref}
      className={clsx(
        "fixed h-screen w-64 flex-1 overflow-y-auto overflow-x-hidden bg-base px-5 pt-10 pb-6 transition-opacity duration-150",

        {
          "max-lg:opacity-0": !isOpen,
          "max-lg:opacity-100": isOpen,
        }
      )}
    >
      <div className="h-full rounded-md bg-none transition duration-200 ease-linear">
        <Link href="/" className="mb-6 flex items-center px-4 no-underline">
          <PuzzlelyIcon className="h-9 w-9" />

          <h1
            className={clsx(
              "relative ml-3 font-heading text-lg font-bold",

              'before:absolute before:left-0 before:right-2.5 before:bottom-1 before:z-[-1] before:h-1.5 before:bg-cyan before:opacity-80 before:content-[""]'
            )}
          >
            Puzzlely
          </h1>
        </Link>

        <Separator />

        {/* Height is calculated via container's paddingY + Icon height + Divider height */}
        <div className="mt-6 flex h-[calc(100%-75px)] flex-col gap-2">
          <Link
            href="/puzzles/create/"
            className={clsx(
              "mb-6 flex h-12 w-full flex-shrink-0 flex-grow-0 basis-auto cursor-pointer items-center justify-start rounded-full bg-cyan px-4 py-3 text-base shadow-[0_0_12px_1px] shadow-cyan/60 outline-none transition",

              "focus:shadow-muted/0.3 focus:shadow-none focus:ring",
              "hover:bg-cyan/80",
              "max-lg:px-[10px]"
            )}
          >
            <div className="mr-3 flex h-7 w-7 items-center justify-center rounded-lg">
              <IoAdd />
            </div>

            <p className="my-auto text-sm font-semibold">Create a Puzzle</p>
          </Link>

          {children}
        </div>
      </div>
    </nav>
  );
});

Sidebar.displayName = "Sidebar";
