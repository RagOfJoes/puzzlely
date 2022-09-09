import { popoverAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, defineStyle } from '@chakra-ui/system';

const { defineMultiStyleConfig, definePartsStyle } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStylePopper = defineStyle({
  zIndex: 10,
});

const baseStyleContent = defineStyle((_) => {
  return {
    width: 'xs',
    bg: 'surface',
    boxShadow: 'sm',
    zIndex: 'inherit',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'inherit',
    _focusVisible: {
      outline: 0,
      boxShadow: 'outline',
    },
  };
});

const baseStyleHeader = defineStyle({
  p: '4',
  borderBottomWidth: '1px',
});

const baseStyleBody = defineStyle({
  py: '6',
  px: '4',
});

const baseStyleFooter = defineStyle({
  p: '4',
  borderTopWidth: '1px',
});

const baseStyleCloseButton = defineStyle({
  top: 1,
  padding: 2,
  insetEnd: 2,
  borderRadius: 'lg',
  position: 'absolute',
});

const baseStyle = definePartsStyle((props) => ({
  popper: baseStylePopper,
  content: baseStyleContent(props),
  header: baseStyleHeader,
  body: baseStyleBody,
  footer: baseStyleFooter,
  arrow: {},
  closeButton: baseStyleCloseButton,
}));

const Popover = defineMultiStyleConfig({
  baseStyle,
});

export default Popover;
