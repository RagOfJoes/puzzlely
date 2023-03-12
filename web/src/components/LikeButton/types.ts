import type { ComponentProps } from "react";

export type LikeButtonProps = ComponentProps<"button"> & {
  isLiked?: boolean;
  numOfLikes?: number;
  onLike?: () => void | Promise<void>;
};
