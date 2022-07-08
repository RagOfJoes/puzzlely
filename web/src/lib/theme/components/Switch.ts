import { switchAnatomy } from '@chakra-ui/anatomy';
import { ComponentStyleConfig } from '@chakra-ui/react';
import {
  mode,
  PartsStyleFunction,
  SystemStyleFunction,
} from '@chakra-ui/theme-tools';

const baseStyleTrack: SystemStyleFunction = (props) => {
  const { colorScheme } = props;

  if (colorScheme !== 'purple') {
    return {
      _checked: {
        bg: mode(`${colorScheme}.500`, `${colorScheme}.200`)(props),
      },
    };
  }
  return {
    _checked: {
      bg: 'primary',
    },
  };
};

const baseStyle: PartsStyleFunction<typeof switchAnatomy> = (props) => ({
  track: baseStyleTrack(props),
});

const Switch: ComponentStyleConfig = {
  baseStyle,
  defaultProps: {
    colorScheme: 'purple',
  },
};

export default Switch;
