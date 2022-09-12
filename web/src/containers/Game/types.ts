import { Dispatch, RefObject, SetStateAction } from 'react';

import { UseGameConnectConnection } from '@/hooks/useGameConnect';
import { Game } from '@/types/game';
import { Block, Puzzle } from '@/types/puzzle';

export type GameContainerProps = {
  game: Game;
};

export type StatsProps = {
  game: Game;
  isRunning: boolean;
  minutes: number;
  onForfeit: () => void;
  onReset: () => void;
  onShuffle: () => void;
  seconds: number;
};

export type ShortcutsProps = Pick<
  StatsProps,
  'onForfeit' | 'onReset' | 'onShuffle'
> & {
  game: Pick<Game, 'completedAt' | 'guessedAt' | 'startedAt'>;
};

export type GridProps = {
  blocks: Block[];
  correct: Game['correct'];
  game: Pick<Game, 'startedAt'>;
  isGameOver: boolean;
  isRunning: boolean;
  isWrong: boolean;
  onBlockSelect: (
    block: Block,
    isCorrect: boolean,
    isSelected: boolean
  ) => void;
  ref: RefObject<HTMLElement>;
  selected: Block[];
};

export type MenusProps = {
  blocks: Block[];
  gridRef: RefObject<HTMLElement>;
  // Limited snapshot of game state to restrict what can re-render the Grid
  game: Pick<
    Game,
    | 'id'
    | 'attempts'
    | 'config'
    | 'correct'
    | 'challengeCode'
    | 'challengedBy'
    | 'results'
    | 'score'
    | 'completedAt'
    | 'guessedAt'
    | 'startedAt'
  > & {
    puzzle: Pick<
      Puzzle,
      | 'id'
      | 'createdBy'
      | 'difficulty'
      | 'groups'
      | 'likedAt'
      | 'maxAttempts'
      | 'name'
      | 'numOfLikes'
      | 'timeAllowed'
      | 'createdAt'
    >;
  };
  isGameOver: boolean;
  isRunning: boolean;
  onConnect: (connected: UseGameConnectConnection) => void;
  onContinue: () => void;
  onMenu: () => void;
  onStart: () => void;
  onUpdateTimeAllowed: (newTime: number) => void;
  setGame: Dispatch<SetStateAction<Game>>;
};

export type ConfigMenuProps = {
  game: MenusProps['game'];
  onMenu: MenusProps['onMenu'];
  onStart: MenusProps['onStart'];
  onUpdateTimeAllowed: MenusProps['onUpdateTimeAllowed'];
  setGame: MenusProps['setGame'];
};

export type MainMenuProps = {
  game: MenusProps['game'];
  onConfig: () => void;
  onStart: MenusProps['onStart'];
};

export type GameOverMenuProps = {
  game: MenusProps['game'];
  onContinue: MenusProps['onContinue'];
  onMenu: MenusProps['onMenu'];
};

export type ConnectMenuProps = {
  blocks: MenusProps['blocks'];
  game: MenusProps['game'];
  onConnect: MenusProps['onConnect'];
};

export type ResultMenuProps = {
  blocks: MenusProps['blocks'];
  game: MenusProps['game'];
  setGame: MenusProps['setGame'];
};
