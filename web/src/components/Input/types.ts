import type { ComponentProps } from "react";

export type InputProps = ComponentProps<"input"> & {
  invalid?: boolean;
};

export type InputLeftIconProps = ComponentProps<"div">;

export type InputRightIconProps = ComponentProps<"div">;
