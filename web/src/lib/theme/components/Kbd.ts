import { defineStyle, defineStyleConfig } from '@chakra-ui/system';
import { mode } from '@chakra-ui/theme-tools';

const baseStyle = defineStyle((props) => {
  return {
    px: '0.4em',
    borderRadius: 'md',
    borderWidth: '1px',
    fontSize: '0.8em',
    fontWeight: 'bold',
    lineHeight: 'normal',
    whiteSpace: 'nowrap',
    color: 'text.secondary',
    borderBottomWidth: '3px',
    bg: mode('gray.100', 'whiteAlpha')(props),
  };
});

const Kbd = defineStyleConfig({
  baseStyle,
});

export default Kbd;
