import { ComponentStyleConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const Input: ComponentStyleConfig = {
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
        },
      },
    }),
  },
  defaultProps: {
    focusBorderColor: 'purple.300',
  },
};

export default Input;
