import { forwardRef, memo, useCallback } from "react";

import {
  GameGrid,
  GameGridBlock,
  GameGridOverlay,
} from "@/components/GameGrid";

import type { GridProps } from "../types";

const Grid = memo(
  forwardRef<HTMLDivElement, GridProps>((props, ref) => {
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
    const { guessedAt, startedAt } = game;

    const isDisabled = !!(isGameOver || !isRunning || guessedAt || !startedAt);

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
              aria-label={startedAt ? block.value : ""}
              isCorrect={isItemCorrect}
              isDisabled={isDisabled}
              isError={isItemSelected && isWrong}
              isSelected={isItemSelected && !isWrong}
              layoutDependency={blocks}
              onClick={() =>
                onBlockSelect(block, isItemCorrect, isItemSelected)
              }
              title={startedAt ? block.value : ""}
            >
              {block.value}
            </GameGridBlock>
          );
        })}

        <GameGridOverlay ref={ref} />
      </GameGrid>
    );
  }),
  (prev, next) => {
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
      // @ts-expect-error
      if (!(key in next) || prev[key] !== next[key]) {
        return false;
      }
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const key in next) {
      // @ts-expect-error
      if (!(key in prev) || prev[key] !== next[key]) {
        return false;
      }
    }

    return true;
  }
);

Grid.displayName = "GameGrid";

export default Grid;
