import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";
import type { SubmitHandler } from "react-hook-form";

import type { Puzzle, PuzzleUpdatePayload } from "@/types/puzzle";

export type PuzzleUpdateFormProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.form>,
  "children" | "defaultValue" | "onSubmit"
> & {
  isDeleted?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void | Promise<void>;
  onEdit?: SubmitHandler<PuzzleUpdatePayload>;
  puzzle: Puzzle;
};
