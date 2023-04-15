import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

export type PuzzleFormCardProps = ComponentPropsWithoutRef<
  typeof Primitive.div
> & {
  caption?: string;
  hideDivider?: boolean;
  title?: string;
};
