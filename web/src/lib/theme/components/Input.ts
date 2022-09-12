import { inputAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/system';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const Input = defineMultiStyleConfig({
  baseStyle: {
    field: {
      _placeholder: {
        color: 'text.secondary',
      },
    },
  },
  variants: {
    filled: (props) => ({
      field: {
        _focusVisible: {
          borderColor: 'transparent',
          boxShadow: 'outline',
          outline: 'none',
        },
        _hover: {
          bg: mode('gray.100', 'whiteAlpha.300')(props),
        },
      },
    }),
    outline: () => ({
      field: {
        _focusVisible: {
          borderColor: 'transparent',
          boxShadow: 'outline',
          outline: 'none',
        },
      },
    }),
  },
  defaultProps: {
    focusBorderColor: 'purple.300',
  } as any,
});

export default Input;
