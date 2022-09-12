import { defineStyleConfig } from '@chakra-ui/system';
import { mode, transparentize } from '@chakra-ui/theme-tools';

const Button = defineStyleConfig({
  variants: {
    solid: (props) => {
      const { theme } = props;

      if (props.colorScheme !== 'purple' && props.colorScheme !== 'cyan') {
        return {};
      }

      if (props.colorScheme === 'cyan') {
        return {
          bg: 'secondary',
          color: 'surface',
          _hover: {
            bg: mode('cyan.500', 'cyan.400')(props),
            '&[disabled]': {
              bg: 'secondary',
            },
          },
          _active: {
            bg: mode('cyan.500', 'cyan.400')(props),
            '&[disabled]': {
              bg: 'secondary',
            },
          },
        };
      }

      return {
        bg: 'primary',
        color: 'surface',
        _hover: {
          bg: mode(
            transparentize('purple.400', 0.7)(theme),
            'purple.400'
          )(props),
          '&[disabled]': {
            bg: 'primary',
          },
        },
        _active: {
          bg: mode(
            transparentize('purple.400', 0.7)(theme),
            'purple.400'
          )(props),
          '&[disabled]': {
            bg: 'primary',
          },
        },
      };
    },
  },
  defaultProps: {
    colorScheme: 'purple',
  },
});

export default Button;
