import type { Dispatch, SetStateAction } from "react";

export type TopbarSearchForm = {
  search: string;
};

export type TopbarProps = {
  links: { path: string; title: string }[];
  isOpen: boolean;
  toggleIsOpen: Dispatch<SetStateAction<boolean>>;
};
