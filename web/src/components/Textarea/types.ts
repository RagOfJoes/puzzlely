import type { ComponentPropsWithoutRef } from "@radix-ui/react-primitive";

export type TextareaProps = ComponentPropsWithoutRef<"textarea"> & {
  invalid?: boolean;
};
