import type { ElementRef } from "react";
import { forwardRef, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import clsx from "clsx";
import { IoHeart, IoHeartOutline } from "react-icons/io5";

import abbreviateNumber from "@/lib/abbreviateNumber";
import omit from "@/lib/omit";

import type { LikeButtonProps } from "./types";

export const LikeButton = forwardRef<
  ElementRef<typeof Primitive.button>,
  LikeButtonProps
>((props, ref) => {
  const {
    className,
    isLiked,
    numOfLikes,
    onLike = () => {},
    ...other
  } = omit(props, ["children"]);

  const formattedNumOfLikes = useMemo(
    () => abbreviateNumber(numOfLikes || 0),
    [numOfLikes]
  );

  return (
    <Primitive.button
      {...other}
      ref={ref}
      onClick={onLike}
      className={clsx(
        "flex h-7 items-center justify-center gap-2 rounded-md border bg-base px-2 outline-none transition",

        "focus-visible:ring",
        "hover:bg-muted/30",

        className
      )}
    >
      {isLiked ? (
        <IoHeart className="text-red" />
      ) : (
        <IoHeartOutline className="text-subtle" />
      )}

      <p className="text-sm font-medium text-subtle">
        {isLiked ? "Liked" : "Like"}
      </p>

      <hr className="h-full w-[1px] bg-muted/20" />

      <p className="text-xs font-semibold leading-tight text-subtle">
        {formattedNumOfLikes}
      </p>
    </Primitive.button>
  );
});

LikeButton.displayName = "LikeButton";
