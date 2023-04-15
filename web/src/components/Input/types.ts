import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

export type InputProps = ComponentPropsWithoutRef<typeof Primitive.input> & {
  invalid?: boolean;
};

export type InputLeftIconProps = ComponentPropsWithoutRef<typeof Primitive.div>;

export type InputRightIconProps = ComponentPropsWithoutRef<
  typeof Primitive.div
>;
