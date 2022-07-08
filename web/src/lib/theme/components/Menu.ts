import { menuAnatomy as parts } from '@chakra-ui/anatomy';
import { ComponentStyleConfig } from '@chakra-ui/react';
import type {
  PartsStyleFunction,
  SystemStyleFunction,
  SystemStyleObject,
} from '@chakra-ui/theme-tools';
import { mode } from '@chakra-ui/theme-tools';

const baseStyleList: SystemStyleFunction = (props) => {
  return {
    py: '2',
    zIndex: 1,
    minW: '3xs',
    bg: 'surface',
    color: 'inherit',
    borderWidth: '1px',
    borderRadius: 'md',
    boxShadow: mode('sm', 'lg')(props),
    borderColor: mode('gray.100', 'whiteAlpha.50')(props),
  };
};

const baseStyleItem: SystemStyleFunction = (props) => {
  return {
    py: '0.4rem',
    px: '0.8rem',
    fontSize: 'sm',
    transitionProperty: 'background',
    transitionDuration: 'ultra-fast',
    transitionTimingFunction: 'ease-in',
    _focusVisible: {
      bg: mode('gray.100', 'slate')(props),
    },
    _active: {
      bg: mode('gray.100', 'slate')(props),
    },
    _expanded: {
      bg: mode('gray.100', 'slate')(props),
    },
    _checked: {
      fontWeight: 'bold',
    },
    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  };
};

const baseStyleGroupTitle: SystemStyleObject = {
  mx: 4,
  my: 2,
  fontSize: 'sm',
  fontWeight: 'semibold',
};

const baseStyleCommand: SystemStyleObject = {
  opacity: 0.6,
};

const baseStyleDivider: SystemStyleObject = {
  border: 0,
  my: '0.5rem',
  opacity: 0.6,
  borderColor: 'inherit',
  borderBottom: '1px solid',
};

const baseStyleButton: SystemStyleObject = {
  color: 'text.secondary',
  transitionProperty: 'common',
  transitionDuration: 'normal',
};

const baseStyle: PartsStyleFunction<typeof parts> = (props) => ({
  button: baseStyleButton,
  list: baseStyleList(props),
  item: baseStyleItem(props),
  groupTitle: baseStyleGroupTitle,
  command: baseStyleCommand,
  divider: baseStyleDivider,
});

const Menu: ComponentStyleConfig = {
  parts: parts.keys,
  baseStyle,
};

export default Menu;
