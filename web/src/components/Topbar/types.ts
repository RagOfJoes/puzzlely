import type { ComponentProps, Dispatch, SetStateAction } from "react";

export type TopbarProps = ComponentProps<"header"> & {
  isOpen: boolean;
  links: { path: string; title: string }[];
  toggleIsOpen: Dispatch<SetStateAction<boolean>>;
};
