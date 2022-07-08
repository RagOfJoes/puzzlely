import { memo } from 'react';

import {
  Box,
  GridItem,
  GridItemProps,
  Text,
  useColorModeValue,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { motion, MotionProps } from 'framer-motion';

const Block = (
  props: GridItemProps &
    MotionProps & {
      error?: boolean;
      correct?: boolean;
      loading?: boolean;
      selected?: boolean;
    }
) => {
  const {
    error = false,
    correct = false,
    selected = false,
    ...otherProps
  } = props;

  const reduceMotion = usePrefersReducedMotion();

  const selectedBoxShadow = useColorModeValue(
    'inset 4px 4px 8px 0 rgba(26, 32, 44, 0.2), inset -4px -4px 8px 0 rgba(247, 250, 252, 0.8)',
    'inset 4px 4px 8px 0 rgba(0, 0, 0, 0.2), inset -4px -4px 8px 0 rgba(26, 32, 44, 0.8)'
  );

  const color = error || correct ? 'white' : 'text.primary';
  const hoverBg = useColorModeValue('gray.200', 'whiteAlpha.300');
  let background = selected ? 'background' : 'surface';
  if (error) {
    background = 'red.500';
  }
  if (correct) {
    background = 'primary';
  }

  return (
    <GridItem
      {...otherProps}
      rowSpan={1}
      colSpan={1}
      color={color}
      as={motion.div}
      borderRadius="xl"
      bgColor={background}
      layout={!reduceMotion}
      cursor={correct ? 'not-allowed' : 'pointer'}
      boxShadow={!error && selected ? selectedBoxShadow : ''}
      transition="0.2s linear background-color,box-shadow,color"
      animate={{
        transition: { damping: 25, type: 'spring' },
      }}
      _hover={
        correct || error || selected
          ? {}
          : {
              bg: hoverBg,
            }
      }
    >
      <Box
        p="2"
        w="100%"
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text
          fontSize="md"
          noOfLines={2}
          align="center"
          userSelect="none"
          fontWeight="medium"
        >
          {otherProps.children}
        </Text>
      </Box>
    </GridItem>
  );
};

export default memo(Block);
