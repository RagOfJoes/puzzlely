import { defineStyleConfig } from '@chakra-ui/system';
import { mode } from '@chakra-ui/theme-tools';

const Tabs = defineStyleConfig({
  variants: {
    'soft-rounded': (props) => {
      return {
        tablist: {
          borderRadius: 'lg',
          bg: mode('blackAlpha.50', 'whiteAlpha.50')(props),
        },
        tab: {
          borderRadius: 'md',
          transition: 'none',
          fontWeight: 'semibold',
          color: 'text.secondary',
          _hover: {
            '&:not([aria-selected=true])': {
              bg: mode('blackAlpha.50', 'whiteAlpha.50')(props),
            },
          },
          _selected: {
            bg: 'primary',
            color: 'surface',
          },
        },
      };
    },
  },
  defaultProps: {
    colorScheme: 'purple',
  },
});

export default Tabs;
