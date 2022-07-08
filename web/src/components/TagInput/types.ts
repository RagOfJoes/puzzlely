import { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';

import { FlexProps, InputProps, TagProps } from '@chakra-ui/react';
import { CSSObject } from '@chakra-ui/system';

/**
 * Utility types
 */

export type MaybeRenderProp<P> = ReactNode | ((props: P) => ReactNode);

/**
 * Base types
 */

export type ItemTag = {
  label: string;
  onRemove: () => void;
};

export interface UseTagInputProps
  extends Omit<InputProps, 'children' | 'onChange'> {
  defaultIsOpen?: boolean;
  defaultQuery?: string;
  defaultValue?: string[];
  value?: string[];
  onChange?: (newValue: string[]) => void;
  onTagRemove?: (removedTag: string) => void;
}

export type TagInputRefMethods =
  | {
      removeItem: UseTagInputReturn['removeItem'];
      resetItems: UseTagInputReturn['resetItems'];
    }
  | undefined;

export type TagInputChildProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export interface TagInputProps extends UseTagInputProps {
  children: MaybeRenderProp<TagInputChildProps>;
  ref?: RefObject<TagInputRefMethods>;
}

export interface UseTagInputReturn {
  children: ReactNode;
  getInputProps: (props: TagInputFieldProps) => Omit<InputProps, 'children'>;
  getCreatableProps: (
    props: TagInputCreatableProps & {
      _fixed?: CSSObject;
      _focusVisible?: CSSObject | any;
      value: string;
      label?: string;
      fixed?: boolean;
      disabled?: boolean;
    }
  ) => FlexProps;
  inputRef: RefObject<HTMLInputElement>;
  inputWrapperRef: RefObject<HTMLDivElement>;
  isOpen: boolean;
  listRef: RefObject<HTMLDivElement>;
  onClose: () => void;
  onOpen: () => void;
  query: string;
  removeItem: (valueToRemove?: string) => void;
  resetItems: (focusInput?: boolean) => void;
  setQuery: Dispatch<SetStateAction<string>>;
  setValue: Dispatch<SetStateAction<string[]>>;
  tagInputProps: TagInputProps;
  tags: ItemTag[];
  value: string[];
}

/**
 * Component props
 */

export interface TagInputFieldProps extends Omit<InputProps, 'children'> {
  children?: MaybeRenderProp<{ tags: UseTagInputReturn['tags'] }>;
}

export interface TagInputTagProps extends TagProps {
  disabled?: boolean;
  label: string;
  onRemove?: () => void;
}

export interface TagInputCreatableProps extends Omit<FlexProps, 'children'> {
  children?: MaybeRenderProp<{ value: string }>;
}
