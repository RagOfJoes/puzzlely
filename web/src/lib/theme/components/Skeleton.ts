import { cssVar } from '@chakra-ui/system';
import { getColor, mode, SystemStyleFunction } from '@chakra-ui/theme-tools';

const startColor = cssVar('skeleton-start-color');
const endColor = cssVar('skeleton-end-color');

const baseStyle: SystemStyleFunction = (props) => {
  //  surface
  const defaultStartColor = mode('gray.100', '#353a43')(props);
  const defaultEndColor = mode('gray.300', 'slate')(props);

  const {
    startColor: startColorProps = defaultStartColor,
    endColor: endColorProps = defaultEndColor,
    theme,
  } = props;

  const start = getColor(theme, startColorProps);
  const end = getColor(theme, endColorProps);

  return {
    [startColor.variable]: start,
    [endColor.variable]: end,
    background: end,
    borderRadius: '2px',
    borderColor: start,
    opacity: 0.7,
  };
};

const Skeleton = {
  baseStyle,
};

export default Skeleton;
