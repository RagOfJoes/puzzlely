import type { ComponentProps } from "react";

import type { SubmitHandler } from "react-hook-form";

import type { User, UserStats, UserUpdatePayload } from "@/types/user";

export type UserCardProps = Omit<ComponentProps<"div">, "children"> & {
  isEditable?: boolean;
  isLoading?: boolean;
  isOpen: boolean;
  onEdit?: SubmitHandler<UserUpdatePayload>;
  stats: UserStats;
  togglsIsOpen: (isOpen: boolean) => void;
  user: User;
};
