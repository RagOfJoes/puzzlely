import { popoverAnatomy as parts } from '@chakra-ui/anatomy';
import type {
  PartsStyleFunction,
  SystemStyleFunction,
  SystemStyleObject,
} from '@chakra-ui/theme-tools';

const baseStylePopper: SystemStyleObject = {
  zIndex: 10,
};

const baseStyleContent: SystemStyleFunction = () => {
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
};

const baseStyleHeader: SystemStyleObject = {
  p: '4',
  borderBottomWidth: '1px',
};

const baseStyleBody: SystemStyleObject = {
  py: '6',
  px: '4',
};

const baseStyleFooter: SystemStyleObject = {
  p: '4',
  borderTopWidth: '1px',
};

const baseStyleCloseButton: SystemStyleObject = {
  top: 1,
  padding: 2,
  insetEnd: 2,
  borderRadius: 'lg',
  position: 'absolute',
};

const baseStyle: PartsStyleFunction<typeof parts> = (props) => ({
  popper: baseStylePopper,
  content: baseStyleContent(props),
  header: baseStyleHeader,
  body: baseStyleBody,
  footer: baseStyleFooter,
  arrow: {},
  closeButton: baseStyleCloseButton,
});

const Popover = {
  parts: parts.keys,
  baseStyle,
};

export default Popover;
