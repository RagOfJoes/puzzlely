import { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';

import { InputProps, TagProps } from '@chakra-ui/react';
import { MaybeRenderProp } from '@chakra-ui/react-utils';

export type TagInputProps = {
  children: ReactNode;
  defaultQuery?: string;
  defaultValue?: string[];
  onChange?: (newValue: string[]) => void;
  onTagRemove?: (removedTag: string) => void;
  ref?: RefObject<TagInputRefMethods>;
  value?: string[];
};

export type TagInputRefMethods =
  | {
      removeItem: UseTagInput['removeItem'];
    }
  | undefined;

export interface TagInputFieldProps extends Omit<InputProps, 'children'> {
  children?: MaybeRenderProp<{ tagProps: UseTagInput['tagProps'] }>;
}

export interface TagInputTagProps extends TagProps {
  disabled?: boolean;
  label: string;
  onRemove: () => void;
}

export type UseTagInput = {
  children: ReactNode;
  inputRef: RefObject<HTMLInputElement>;
  inputWrapperRef: RefObject<HTMLDivElement>;
  query: string;
  removeItem: (valueToRemove?: string) => void;
  setQuery: Dispatch<SetStateAction<string>>;
  setValue: Dispatch<SetStateAction<string[]>>;
  tagProps: TagInputTagProps[];
  value: string[];
};
