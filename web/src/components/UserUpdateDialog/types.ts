import type * as Dialog from "@radix-ui/react-dialog";
import type { ComponentPropsWithoutRef } from "@radix-ui/react-primitive";
import type { SubmitHandler } from "react-hook-form";

import type { UserUpdatePayload } from "@/types/user";

export type UserUpdateDialogProps = Omit<
  ComponentPropsWithoutRef<typeof Dialog.Content>,
  "onSubmit"
> & {
  defaultValues: UserUpdatePayload;
  isOpen: boolean;
  onSubmit?: SubmitHandler<UserUpdatePayload>;
  toggleIsOpen: (isOpen: boolean) => void;
};
