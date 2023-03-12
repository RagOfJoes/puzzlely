import type { ComponentProps, Dispatch, SetStateAction } from "react";

export type TopbarSearchForm = {
  search: string;
};

export type TopbarProps = ComponentProps<"header"> & {
  isOpen: boolean;
  links: { path: string; title: string }[];
  toggleIsOpen: Dispatch<SetStateAction<boolean>>;
};
