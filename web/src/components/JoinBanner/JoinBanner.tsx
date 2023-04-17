import type { ElementRef } from "react";
import { forwardRef } from "react";

import type { ComponentPropsWithoutRef } from "@radix-ui/react-primitive";
import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import Link from "next/link";
import { IoArrowForward } from "react-icons/io5";

import { JoinIcon } from "@/components/JoinIcon";
import omit from "@/lib/omit";

export const JoinBanner = forwardRef<
  ElementRef<typeof Primitive.div>,
  ComponentPropsWithoutRef<typeof Primitive.div>
>((props, ref) => {
  const { className, ...other } = omit(props, ["children"]);

  return (
    <Primitive.div
      {...other}
      ref={ref}
      className={clsx(
        "relative flex rounded-lg border bg-surface px-12 py-6",

        "max-lg:px-6",
        "max-md:px-4",

        className
      )}
    >
      <div
        className={clsx(
          "flex basis-3/5 flex-col items-start justify-center",

          "max-lg:basis-full"
        )}
      >
        <h2 className="font-heading text-xl font-bold">
          Create, play, and, share brilliant puzzles
        </h2>

        <p className="mt-2 text-lg text-subtle">
          Join <span className="font-bold text-cyan">puzzlely.io</span> now to
          create and share amazing puzzles. Challenge friends and other users to
          see how you stack up against them.
        </p>

        <Link
          href="/signup"
          className={clsx(
            "relative mt-8 flex h-10 shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

            "active:bg-cyan/70",
            "focus-visible:ring focus-visible:ring-cyan/60",
            "hover:bg-cyan/60",
            "max-lg:mt-4"
          )}
        >
          Get Started
          <IoArrowForward />
        </Link>
      </div>

      <JoinIcon
        aria-label="Join now"
        className={clsx(
          "block max-h-56 w-2/5",

          "max-lg:hidden max-lg:w-0"
        )}
      />
    </Primitive.div>
  );
});

JoinBanner.displayName = "JoinBanner";
