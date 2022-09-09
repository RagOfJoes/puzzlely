import { selectAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/system';

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyleField = defineStyle((_) => {
  return {
    bg: 'surface',
    appearance: 'none',
    paddingBottom: '1px',
    lineHeight: 'normal',
    '> option, > optgroup': {
      bg: 'surface',
    },
  };
});

const baseStyle = definePartsStyle((props) => ({
  field: baseStyleField(props),
}));

const Select = defineMultiStyleConfig({
  baseStyle,
  variants: {
    outline: () => ({
      field: {
        _focusVisible: {
          borderColor: 'transparent',
          boxShadow: 'outline',
        },
      },
    }),
  },
  defaultProps: {
    colorScheme: 'purple',
  },
});

export default Select;
