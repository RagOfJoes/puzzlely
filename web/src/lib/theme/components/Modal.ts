import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/system';
import { mode } from '@chakra-ui/theme-tools';

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle((props) => ({
  overlay: {
    bg: mode('rgba(243,244,246,0.6)', 'rgba(40,44,52,0.6)')(props),
  },
  dialog: {
    bg: 'surface',
    boxShadow: 'md',
  },
}));

const Modal = defineMultiStyleConfig({
  baseStyle,
});

export default Modal;
