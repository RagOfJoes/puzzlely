import type { ComponentProps } from "react";

import type { SubmitHandler } from "react-hook-form";

import type { UserUpdatePayload } from "@/types/user";

export type UserUpdateModalProps = Omit<ComponentProps<"div">, "onSubmit"> & {
  defaultValues: UserUpdatePayload;
  isOpen: boolean;
  onSubmit?: SubmitHandler<UserUpdatePayload>;
  toggleIsOpen: (isOpen: boolean) => void;
};
