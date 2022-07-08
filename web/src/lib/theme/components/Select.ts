import { selectAnatomy } from '@chakra-ui/anatomy';
import { ComponentStyleConfig } from '@chakra-ui/react';
import {
  PartsStyleFunction,
  SystemStyleFunction,
} from '@chakra-ui/theme-tools';

const baseStyleField: SystemStyleFunction = () => {
  return {
    bg: 'surface',
    appearance: 'none',
    paddingBottom: '1px',
    lineHeight: 'normal',
    '> option, > optgroup': {
      bg: 'surface',
    },
  };
};

const baseStyle: PartsStyleFunction<typeof selectAnatomy> = (props) => ({
  field: baseStyleField(props),
});

const Select: ComponentStyleConfig = {
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
};

export default Select;
