import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";
import type { SubmitHandler } from "react-hook-form";

import type { PuzzleCreatePayload } from "@/types/puzzle";

export type PuzzleCreateFormProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.form>,
  "children" | "defaultValue" | "onSubmit"
> & {
  defaultValues?: PuzzleCreatePayload;
  onSubmit?: SubmitHandler<PuzzleCreatePayload>;
};
