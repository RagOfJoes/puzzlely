import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";
import type { SubmitHandler } from "react-hook-form";

import type { UserUpdatePayload } from "@/types/user";

export type UserSetupFormProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.form>,
  "children" | "onSubmit"
> & {
  defaultValues?: UserUpdatePayload;
  onSubmit?: SubmitHandler<UserUpdatePayload>;
};
