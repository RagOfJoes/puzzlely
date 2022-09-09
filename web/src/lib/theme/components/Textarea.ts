import { defineStyleConfig } from '@chakra-ui/system';
import { mode } from '@chakra-ui/theme-tools';

const Textarea = defineStyleConfig({
  baseStyle: {
    _placeholder: {
      color: 'text.secondary',
    },
  },
  variants: {
    filled: (props) => ({
      _focusVisible: {
        borderColor: 'transparent',
        boxShadow: 'outline',
      },
      _hover: {
        bg: mode('gray.100', 'whiteAlpha.300')(props),
      },
    }),
    outline: () => ({
      _focusVisible: {
        borderColor: 'transparent',
        boxShadow: 'outline',
      },
    }),
  },
  defaultProps: {
    focusBorderColor: 'purple.300',
  } as any,
});

export default Textarea;
