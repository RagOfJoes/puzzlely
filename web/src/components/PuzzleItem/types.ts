import type { ComponentProps } from "react";

import type { Primitive } from "@radix-ui/react-primitive";

import type { Puzzle } from "@/types/puzzle";

export type PuzzleItemProps = ComponentProps<typeof Primitive.div> &
  Pick<Puzzle, "difficulty" | "id" | "maxAttempts" | "name" | "timeAllowed"> & {
    createdBy: string;
  };
