import { keyframes } from '@chakra-ui/system';
import { getColor, mode, SystemStyleFunction } from '@chakra-ui/theme-tools';

const fade = (startColor: string, endColor: string) =>
  keyframes({
    from: { borderColor: startColor, background: startColor },
    to: { borderColor: endColor, background: endColor },
  });

const baseStyle: SystemStyleFunction = (props) => {
  //  surface
  const defaultStartColor = mode('gray.100', '#353a43')(props);
  const defaultEndColor = mode('gray.300', 'slate')(props);

  const {
    startColor = defaultStartColor,
    endColor = defaultEndColor,
    speed,
    theme,
  } = props;

  const start = getColor(theme, startColor);
  const end = getColor(theme, endColor);

  return {
    animation: `${speed}s linear infinite alternate ${fade(start, end)}`,
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
