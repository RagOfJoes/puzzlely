import type { ElementRef } from "react";
import { forwardRef } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { IoClose } from "react-icons/io5";

import type { TagInputItemProps } from "./types";

export const TagInputItem = forwardRef<
  ElementRef<typeof Primitive.span>,
  TagInputItemProps
>((props, ref) => {
  const { children, className, disabled, onRemove, ...other } = props;

  return (
    <li className="flex items-start truncate">
      <Primitive.span
        {...other}
        ref={ref}
        aria-disabled={disabled}
        className={clsx(
          "group inline-flex w-full items-center rounded-md bg-muted/20 px-2 py-1 text-sm font-medium",

          className
        )}
      >
        <p
          className={clsx(
            "line-clamp-1 inline-block text-ellipsis whitespace-nowrap leading-snug",

            "group-aria-disabled:opacity-40"
          )}
        >
          {children}
        </p>

        <button
          aria-label="Close"
          className={clsx(
            "-mr-1 ml-1.5 flex h-5 w-5 shrink-0 cursor-pointer appearance-none items-center justify-center rounded-full opacity-50 outline-none transition",

            "disabled:cursor-not-allowed",
            "focus-visible:enabled:ring",
            "hover:enabled:opacity-100"
          )}
          disabled={disabled}
          onClick={() => {
            if (disabled) {
              return;
            }

            onRemove();
          }}
        >
          <IoClose />
        </button>
      </Primitive.span>
    </li>
  );
});

TagInputItem.displayName = "TagInputItem";
