import { defineStyle, defineStyleConfig } from '@chakra-ui/system';
import { getColor, mode, transparentize } from '@chakra-ui/theme-tools';

const baseStyle = defineStyle({
  px: 2,
  py: 0.75,
  fontSize: 'xs',
  borderRadius: 'md',
  fontWeight: 'medium',
  textTransform: 'uppercase',
});

const variantSolid = defineStyle((props) => {
  const { colorScheme: c, theme } = props;
  const dark = transparentize(`${c}.500`, 0.6)(theme);
  return {
    bg: mode(`${c}.500`, dark)(props),
    color: mode(`white`, `whiteAlpha.800`)(props),
  };
});

const variantSubtle = defineStyle((props) => {
  const { colorScheme: c, theme } = props;
  const darkBg = transparentize(`${c}.200`, 0.16)(theme);
  return {
    bg: mode(`${c}.100`, darkBg)(props),
    color: mode(`${c}.800`, `${c}.200`)(props),
  };
});

const variantOutline = defineStyle((props) => {
  const { colorScheme: c, theme } = props;
  const darkColor = transparentize(`${c}.200`, 0.8)(theme);
  const lightColor = getColor(theme, `${c}.500`);
  const color = mode(lightColor, darkColor)(props);

  return {
    color,
    boxShadow: `inset 0 0 0px 1px ${color}`,
  };
});

const variants = {
  solid: variantSolid,
  subtle: variantSubtle,
  outline: variantOutline,
};

const Badge = defineStyleConfig({
  baseStyle,
  variants,
  defaultProps: {
    variant: 'solid',
    colorScheme: 'gray',
  },
});

export default Badge;
