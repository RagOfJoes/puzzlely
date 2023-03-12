import type { ComponentProps } from "react";

import type { Puzzle } from "@/types/puzzle";

export type PuzzleCardProps = ComponentProps<"div"> &
  Pick<
    Puzzle,
    | "createdAt"
    | "difficulty"
    | "id"
    | "likedAt"
    | "maxAttempts"
    | "name"
    | "numOfLikes"
    | "timeAllowed"
  > & {
    createdBy: string;
    isEditable?: boolean;
    onLike?: () => void | Promise<void>;
  };
