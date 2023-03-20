import type { ComponentProps } from "react";

import type { SubmitHandler } from "react-hook-form";

import type { UserUpdatePayload } from "@/types/user";

export type UserSetupFormProps = Omit<
  ComponentProps<"form">,
  "children" | "onSubmit"
> & {
  defaultValues?: UserUpdatePayload;
  onSubmit?: SubmitHandler<UserUpdatePayload>;
};
