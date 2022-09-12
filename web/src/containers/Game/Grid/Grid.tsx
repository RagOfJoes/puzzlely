import { memo, useCallback } from 'react';

import { Box, forwardRef, Grid as ChakraGrid } from '@chakra-ui/react';

import { GridProps } from '../types';
import Block from './Block';

const Grid = forwardRef<GridProps, 'div'>((props, ref) => {
  const { blocks, correct, game, isRunning, isWrong, onBlockSelect, selected } =
    props;
  const { startedAt } = game;

  const isSelected = useCallback(
    (id: string) => {
      return selected.findIndex((s) => s.id === id) !== -1;
    },
    [selected]
  );
  const isCorrect = useCallback(
    (id: string) => {
      return correct.includes(id);
    },
    [correct]
  );

  return (
    <ChakraGrid
      gap="2"
      w="100%"
      borderRadius="lg"
      position="relative"
      templateRows="repeat(4, 1fr)"
      templateColumns="repeat(4, minmax(0, 1fr))"
      css={{
        '&:before': {
          width: 0,
          content: '""',
          gridRow: '1 / 1',
          gridColumn: '1 / 1',
          paddingBottom: '100%',
        },
        '& > *:first-of-type': {
          gridRow: '1 / 1',
          gridColumn: '1 / 1',
        },
      }}
    >
      {blocks.map((block) => {
        const isItemSelected = isSelected(block.id);
        const isItemCorrect = isCorrect(block.groupID);

        return (
          <Block
            key={block.id}
            correct={isItemCorrect}
            selected={isItemSelected}
            layoutDependency={blocks}
            error={isWrong && isItemSelected}
            title={!startedAt ? '' : block.value}
            onClick={(_) => onBlockSelect(block, isItemCorrect, isItemSelected)}
          >
            {!startedAt || !isRunning
              ? '_'.repeat(block.value.length)
              : block.value}
          </Block>
        );
      })}

      <Box ref={ref} />
    </ChakraGrid>
  );
});

// eslint-disable-next-line react/display-name
export default memo(Grid, (prev, next) => {
  const isStarted = !!next.game.startedAt;
  const isGameOver = prev.isGameOver && next.isGameOver;
  const isSameCorrect = prev.correct.length === next.correct.length;
  // If game hasn't started yet, correct blocks hasn't changed, and, if user didn't just come from game over menu
  if (!isStarted && isSameCorrect && !isGameOver) {
    return true;
  }

  // Do a shallow comparison for props
  // eslint-disable-next-line no-restricted-syntax
  for (const key in prev) {
    if (!(key in next) || prev[key] !== next[key]) {
      return false;
    }
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const key in next) {
    if (!(key in prev) || prev[key] !== next[key]) {
      return false;
    }
  }
  return true;
});
