import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import Link from "next/link";
import { IoAdd } from "react-icons/io5";

import { PuzzlelyIcon } from "@/components/PuzzlelyIcon";
import { Separator } from "@/components/Separator";

import type { SidebarProps } from "./types";

export const Sidebar = forwardRef<
  ElementRef<typeof Primitive.nav>,
  SidebarProps
>((props, ref) => {
  const { children, isOpen } = props;

  return (
    <Primitive.nav
      ref={ref}
      className={clsx(
        "fixed h-screen w-64 flex-1 overflow-y-auto overflow-x-hidden bg-base px-5 pb-6 pt-10 transition-opacity duration-150",

        {
          "max-lg:opacity-0": !isOpen,
          "max-lg:opacity-100": isOpen,
        }
      )}
    >
      <div className="h-full rounded-md bg-none transition duration-200 ease-linear">
        <Link
          href="/"
          className={clsx(
            "mb-6 flex items-center px-4 no-underline outline-none",

            "focus-visible:ring"
          )}
        >
          <PuzzlelyIcon className="h-10 w-10" />

          <h1
            className={clsx(
              "relative ml-3 font-heading text-xl font-bold",

              'before:absolute before:bottom-1 before:left-0 before:right-2.5 before:z-[-1] before:h-1.5 before:bg-cyan before:opacity-80 before:content-[""]'
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

              "focus:shadow-none focus-visible:ring focus-visible:ring-cyan/60",
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
    </Primitive.nav>
  );
});

Sidebar.displayName = "Sidebar";
