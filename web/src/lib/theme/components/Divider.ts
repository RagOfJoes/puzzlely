import { defineStyle, defineStyleConfig } from '@chakra-ui/system';

const baseStyle = defineStyle({
  opacity: 1,
  borderColor: 'inherit',
});

const variantSolid = defineStyle({
  borderStyle: 'solid',
});

const variantDashed = defineStyle({
  borderStyle: 'dashed',
});

const variants = {
  solid: variantSolid,
  dashed: variantDashed,
};

const Divider = defineStyleConfig({
  baseStyle,
  variants,
  defaultProps: {
    variant: 'solid',
  },
});

export default Divider;
