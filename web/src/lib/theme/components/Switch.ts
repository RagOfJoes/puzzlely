import { switchAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/system';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyleTrack = defineStyle((props) => {
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
});

const baseStyle = definePartsStyle((props) => ({
  track: baseStyleTrack(props),
}));

const Switch = defineMultiStyleConfig({
  baseStyle,
  defaultProps: {
    colorScheme: 'purple',
  },
});

export default Switch;
