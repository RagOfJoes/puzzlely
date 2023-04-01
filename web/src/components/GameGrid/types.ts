import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";
import type { MotionProps } from "framer-motion";

export type GameGridProps = ComponentPropsWithoutRef<typeof Primitive.div>;

export type GameGridBlockProps = ComponentPropsWithoutRef<
  typeof Primitive.button
> &
  MotionProps & {
    isCorrect?: boolean;
    isDisabled?: boolean;
    isError?: boolean;
    isSelected?: boolean;
  };

export type GameGridOverlayProps = ComponentPropsWithoutRef<
  typeof Primitive.div
>;
