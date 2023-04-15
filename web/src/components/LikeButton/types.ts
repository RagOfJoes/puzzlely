import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

export type LikeButtonProps = ComponentPropsWithoutRef<
  typeof Primitive.button
> & {
  isLiked?: boolean;
  numOfLikes?: number;
  onLike?: () => void | Promise<void>;
};
