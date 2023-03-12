import type { ComponentProps } from "react";

import type { Puzzle } from "@/types/puzzle";

export type PuzzleItemProps = ComponentProps<"div"> &
  Pick<Puzzle, "difficulty" | "id" | "maxAttempts" | "name" | "timeAllowed"> & {
    createdBy: string;
  };
