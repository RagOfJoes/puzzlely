import { Dispatch, ReactNode, SetStateAction } from 'react';

import {
  BoxProps,
  MenuButtonProps,
  MenuItemOptionProps,
  MenuProps,
  TextProps,
} from '@chakra-ui/react';

export type FilterProps = BoxProps & Partial<UseFilter>;

export type FilterLabelProps = TextProps;

export type FilterMenuProps = Omit<MenuProps, 'children'> & {
  buttonProps?: MenuButtonProps;
  children: ReactNode;
  formatValue?: (value: string) => string;
  placeholder?: string;
};

export type FilterOptionProps = Omit<MenuItemOptionProps, 'value'> & {
  value: string;
};

export type UseFilter = {
  onChange: Dispatch<SetStateAction<string>>;
  value: string;
};
