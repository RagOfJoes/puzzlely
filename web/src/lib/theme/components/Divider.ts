import type { SystemStyleObject } from '@chakra-ui/theme-tools';

const baseStyle: SystemStyleObject = {
  opacity: 1,
  borderColor: 'inherit',
};

const variantSolid: SystemStyleObject = {
  borderStyle: 'solid',
};

const variantDashed: SystemStyleObject = {
  borderStyle: 'dashed',
};

const variants = {
  solid: variantSolid,
  dashed: variantDashed,
};

const defaultProps = {
  variant: 'solid',
};

const Divider = {
  baseStyle,
  variants,
  defaultProps,
};

export default Divider;
