import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

export type SkeletonProps = ComponentPropsWithoutRef<typeof Primitive.div> & {
  isLoaded?: boolean;
};
