import type { ReactNode } from "react";

import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

export type GameStatCardProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.div>,
  "children"
> & {
  body: string;
  icon: ReactNode;
  label: string;
};
