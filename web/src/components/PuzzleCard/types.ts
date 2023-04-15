import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

import type { Puzzle } from "@/types/puzzle";

export type PuzzleCardProps = ComponentPropsWithoutRef<typeof Primitive.div> &
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
