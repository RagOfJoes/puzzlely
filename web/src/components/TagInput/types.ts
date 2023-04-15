import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import type {
  ComponentPropsWithoutRef,
  Primitive,
} from "@radix-ui/react-primitive";

import type { InputProps } from "@/components/Input";

export type TagInputRefMethods =
  | {
      removeItem: UseTagInput["removeItem"];
    }
  | undefined;

export type TagInputProps = {
  children: ReactNode;
  defaultQuery?: string;
  defaultValue?: string[];
  onChange?: (newValue: string[]) => void;
  onTagRemove?: (removedTag: string) => void;
  ref?: RefObject<TagInputRefMethods>;
  value?: string[];
};

export type TagInputFieldProps = Omit<InputProps, "children"> & {
  children?: ReactNode | ((props: TagInputItemProps[]) => ReactNode);
};

export type TagInputItemProps = Omit<
  ComponentPropsWithoutRef<typeof Primitive.span>,
  "children"
> & {
  children: string;
  disabled?: boolean;
  onRemove: () => void;
};

export type UseTagInput = {
  children: ReactNode;
  inputRef: RefObject<HTMLInputElement>;
  inputWrapperRef: RefObject<HTMLUListElement>;
  query: string;
  removeItem: (valueToRemove?: string) => void;
  setQuery: Dispatch<SetStateAction<string>>;
  setValue: Dispatch<SetStateAction<string[]>>;
  tagProps: TagInputItemProps[];
  value: string[];
};
