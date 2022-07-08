import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const global = {
  styles: {
    global: (props: StyleFunctionProps) => {
      const backgroundKey = '--colors-background';
      // Light: gray.100 | Dark: Custom
      const backgroundColor = mode('#f4f4f7', '#282c34')(props);
      const surfaceKey = '--colors-surface';
      const surfaceColor = mode('white', '#353a43')(props);

      const textKey = '--colors-text';
      // Light: gray.700 | Dark: white
      const textColor = mode('#374151', 'white')(props);
      const secondaryTextKey = '--colors-text-secondary';
      // Light: blackAlpha.600 | Dark: whiteAlpha.600
      const secondaryTextColor = mode('#0000007a', '#ffffff7a')(props);

      // Light: purple.500 | Dark: purple.300
      const primaryKey = '--colors-primary';
      const primaryColor = mode('#9883d5', '#c4b5fd')(props);
      // Light: cyan.400 | Dark: cyan.300
      const secondaryKey = '--colors-secondary';
      const secondaryColor = mode('#22d3ee', '#67e8f9')(props);
      return {
        // Workaround for responsive colors
        ':root': {
          [backgroundKey]: backgroundColor,
          [surfaceKey]: surfaceColor,

          [textKey]: textColor,
          [secondaryTextKey]: secondaryTextColor,
          [primaryKey]: primaryColor,
          [secondaryKey]: secondaryColor,
        },
        '::selection': {
          bg: primaryColor,
          color: 'white',
        },

        '*': {
          borderColor: mode('gray.300', 'whiteAlpha.300')(props),
        },
        body: {
          bg: backgroundColor,
          color: textColor,
          transition: 'none',
        },
      };
    },
  },
};

export default global;
