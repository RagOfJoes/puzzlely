import { useMemo } from 'react';

import {
  Box,
  forwardRef,
  GridItem,
  Text,
  useColorModeValue,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { GameGridBlockProps } from './types';

const GameGridBlock = forwardRef<GameGridBlockProps, 'div'>((props, ref) => {
  const {
    children,
    isCorrect = false,
    isDisabled = false,
    isError = false,
    isSelected = false,
    ...otherProps
  } = props;

  const reduceMotion = usePrefersReducedMotion();

  const background = useMemo(() => {
    if (isCorrect) {
      return 'primary';
    }
    if (isError) {
      return 'red.500';
    }
    if (isSelected) {
      return 'background';
    }

    return 'surface';
  }, [isCorrect, isError, isSelected]);
  const color = isCorrect || isError ? 'white' : 'text.primary';
  const hoverBg = useColorModeValue('gray.200', 'whiteAlpha.300');
  const selectedBoxShadow = useColorModeValue(
    'inset 4px 4px 8px 0 rgba(26, 32, 44, 0.2), inset -4px -4px 8px 0 rgba(247, 250, 252, 0.8)',
    'inset 4px 4px 8px 0 rgba(0, 0, 0, 0.2), inset -4px -4px 8px 0 rgba(26, 32, 44, 0.8)'
  );

  return (
    <GridItem
      ref={ref}
      {...otherProps}
      rowSpan={1}
      colSpan={1}
      color={color}
      as={motion.div}
      borderRadius="xl"
      bgColor={background}
      layout={!reduceMotion}
      opacity={isDisabled ? '0.4' : '1'}
      cursor={isCorrect ? 'not-allowed' : 'pointer'}
      boxShadow={!isError && isSelected ? selectedBoxShadow : ''}
      transition="0.2s linear background-color,box-shadow,color, 0.4s linear opacity"
      animate={{
        transition: { damping: 25, type: 'spring' },
      }}
      _hover={
        isCorrect || isDisabled || isError || isSelected
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
          {isDisabled ? '_'.repeat(children?.toString().length || 0) : children}
        </Text>
      </Box>
    </GridItem>
  );
});

export default GameGridBlock;
