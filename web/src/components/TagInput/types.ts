import { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';

import { InputProps, TagProps } from '@chakra-ui/react';

/**
 * Utility types
 */

export type MaybeRenderProp<P> = ReactNode | ((props: P) => ReactNode);

/**
 * Base types
 */

export type TagProp = {
  label: string;
  onRemove: () => void;
};

export type UseTagInputProps = {
  defaultQuery?: string;
  defaultValue?: string[];
  value?: string[];
  onChange?: (newValue: string[]) => void;
  onTagRemove?: (removedTag: string) => void;
};

export type TagInputRefMethods =
  | {
      removeItem: UseTagInputReturn['removeItem'];
    }
  | undefined;

export interface TagInputProps extends UseTagInputProps {
  children: ReactNode;
  ref?: RefObject<TagInputRefMethods>;
}

export type UseTagInputReturn = {
  children: ReactNode;
  inputRef: RefObject<HTMLInputElement>;
  inputWrapperRef: RefObject<HTMLDivElement>;
  query: string;
  removeItem: (valueToRemove?: string) => void;
  setQuery: Dispatch<SetStateAction<string>>;
  setValue: Dispatch<SetStateAction<string[]>>;
  tagProps: TagProp[];
  value: string[];
};

/**
 * Component props
 */

export interface TagInputFieldProps extends Omit<InputProps, 'children'> {
  children?: MaybeRenderProp<{ tagProps: UseTagInputReturn['tagProps'] }>;
}

export interface TagInputTagProps extends TagProps {
  disabled?: boolean;
  label: string;
  onRemove?: () => void;
}
