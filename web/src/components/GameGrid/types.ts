import { ReactNode } from 'react';

import { GridItemProps } from '@chakra-ui/react';
import { MotionProps } from 'framer-motion';

export type UseGameGrid = {
  children: ReactNode;
};

export type GameGridProps = {};

export type GameGridBlockProps = GridItemProps &
  MotionProps & {
    children: ReactNode;
    isCorrect?: boolean;
    isDisabled?: boolean;
    isError?: boolean;
    isSelected?: boolean;
  };
