import { memo, useCallback } from 'react';

import { Box, forwardRef } from '@chakra-ui/react';

import GameGrid, { GameGridBlock } from '@/components/GameGrid';

import { GridProps } from '../types';

const Grid = forwardRef<GridProps, 'div'>((props, ref) => {
  const {
    blocks,
    correct,
    game,
    isGameOver,
    isRunning,
    isWrong,
    onBlockSelect,
    selected,
  } = props;
  const { completedAt, guessedAt, startedAt } = game;

  const isDisabled = !!(
    isGameOver ||
    !isRunning ||
    guessedAt ||
    !startedAt ||
    completedAt
  );

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
    <GameGrid>
      {blocks.map((block) => {
        const isItemSelected = isSelected(block.id);
        const isItemCorrect = isCorrect(block.groupID);

        return (
          <GameGridBlock
            key={block.id}
            isDisabled={isDisabled}
            isCorrect={isItemCorrect}
            layoutDependency={blocks}
            isSelected={isItemSelected}
            isError={isWrong && isItemSelected}
            title={!startedAt ? '' : block.value}
            onClick={(_) => onBlockSelect(block, isItemCorrect, isItemSelected)}
          >
            {block.value}
          </GameGridBlock>
        );
      })}

      <Box ref={ref} />
    </GameGrid>
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
