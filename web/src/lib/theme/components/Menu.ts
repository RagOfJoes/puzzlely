import { menuAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/system';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyleList = defineStyle((props) => {
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
});

const baseStyleItem = defineStyle((props) => {
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
});

const baseStyleGroupTitle = defineStyle({
  mx: 4,
  my: 2,
  fontSize: 'sm',
  fontWeight: 'semibold',
});

const baseStyleCommand = defineStyle({
  opacity: 0.6,
});

const baseStyleDivider = defineStyle({
  border: 0,
  my: '0.5rem',
  opacity: 0.6,
  borderColor: 'inherit',
  borderBottom: '1px solid',
});

const baseStyleButton = defineStyle({
  color: 'text.secondary',
  transitionProperty: 'common',
  transitionDuration: 'normal',
});

const baseStyle = definePartsStyle((props) => ({
  button: baseStyleButton,
  list: baseStyleList(props),
  item: baseStyleItem(props),
  groupTitle: baseStyleGroupTitle,
  command: baseStyleCommand,
  divider: baseStyleDivider,
}));

const Menu = defineMultiStyleConfig({
  baseStyle,
});

export default Menu;
