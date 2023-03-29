import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";
import type { SubmitHandler } from "react-hook-form";

import type { User, UserStats, UserUpdatePayload } from "@/types/user";

export type UserCardProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.div>,
  "children"
> & {
  isEditable?: boolean;
  isLoading?: boolean;
  isOpen: boolean;
  onEdit?: SubmitHandler<UserUpdatePayload>;
  stats: UserStats;
  togglsIsOpen: (isOpen: boolean) => void;
  user: User;
};
