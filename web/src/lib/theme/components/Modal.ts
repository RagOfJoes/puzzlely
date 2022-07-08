import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { mode, PartsStyleFunction } from '@chakra-ui/theme-tools';

const baseStyle: PartsStyleFunction<typeof parts> = (props) => ({
  overlay: {
    bg: mode('rgba(243,244,246,0.6)', 'rgba(40,44,52,0.6)')(props),
  },
  dialog: {
    bg: 'surface',
    boxShadow: 'md',
  },
});

const Modal = {
  baseStyle,
};

export default Modal;
