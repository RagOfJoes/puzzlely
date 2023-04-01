import type { Dispatch, RefObject, SetStateAction } from "react";

import type { StoreApi } from "zustand";

import type useGameBlockSelect from "@/hooks/useGameBlockSelect";
import type { UseGameConnectConnection } from "@/hooks/useGameConnect";
import type useGameConnect from "@/hooks/useGameConnect";
import type useGameContinue from "@/hooks/useGameContinue";
import type useGameForfeit from "@/hooks/useGameForfeit";
import type useGameMenu from "@/hooks/useGameMenu";
import type useGameReset from "@/hooks/useGameReset";
import type useGameShuffle from "@/hooks/useGameShuffle";
import type useGameStart from "@/hooks/useGameStart";
import type { Game } from "@/types/game";
import type { Block, Puzzle } from "@/types/puzzle";

export type UseGameProps = GameContainerProps;

export type UseGame = {
  blocks: Block[];
  correct: Game["correct"];
  game: Game;
  gridRef: RefObject<HTMLElement>;
  isGameOver: boolean;
  isRunning: boolean;
  isWrong: boolean;
  onBlockSelect: ReturnType<typeof useGameBlockSelect>;
  onConnect: ReturnType<typeof useGameConnect>;
  onContinue: ReturnType<typeof useGameContinue>;
  onForfeit: ReturnType<typeof useGameForfeit>;
  onMenu: ReturnType<typeof useGameMenu>;
  onReset: ReturnType<typeof useGameReset>;
  onShuffle: ReturnType<typeof useGameShuffle>;
  onStart: ReturnType<typeof useGameStart>;
  onUpdateMaxAttempts: (newAttempts: number) => void;
  onUpdateTimeAllowed: (newTime: number) => void;
  selected: Block[];
  time: number;
};

export type GameState = {
  blocks: Block[];
  correct: Game["correct"];
  game: Game;
  isGameOver: boolean;
  isRunning: boolean;
  isWrong: boolean;
  onBlockSelect: ReturnType<typeof useGameBlockSelect>;
  onConnect: ReturnType<typeof useGameConnect>;
  onContinue: ReturnType<typeof useGameContinue>;
  onForfeit: ReturnType<typeof useGameForfeit>;
  onMenu: ReturnType<typeof useGameMenu>;
  onMount: () => void;
  onReset: ReturnType<typeof useGameReset>;
  onShuffle: ReturnType<typeof useGameShuffle>;
  onStart: ReturnType<typeof useGameStart>;
  onUpdateMaxAttempts: (newAttempts: number) => void;
  onUpdateTimeAllowed: (newTime: number) => void;
  selected: Block[];
  time: number;
};

export type GameStore = StoreApi<GameState>;

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
  "onForfeit" | "onReset" | "onShuffle"
> & {
  game: Pick<Game, "completedAt" | "guessedAt" | "startedAt">;
};

export type GridProps = {
  blocks: Block[];
  correct: Game["correct"];
  game: Pick<Game, "completedAt" | "guessedAt" | "startedAt">;
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
    | "id"
    | "attempts"
    | "config"
    | "correct"
    | "challengeCode"
    | "challengedBy"
    | "results"
    | "score"
    | "completedAt"
    | "guessedAt"
    | "startedAt"
  > & {
    puzzle: Pick<
      Puzzle,
      | "id"
      | "createdBy"
      | "difficulty"
      | "groups"
      | "likedAt"
      | "maxAttempts"
      | "name"
      | "numOfLikes"
      | "timeAllowed"
      | "createdAt"
    >;
  };
  isGameOver: boolean;
  onConnect: (connected: UseGameConnectConnection) => void;
  onContinue: () => void;
  onMenu: () => void;
  onStart: () => void;
  onUpdateTimeAllowed: (newTime: number) => void;
  setGame: Dispatch<SetStateAction<Game>>;
};

export type ConfigMenuProps = {
  game: MenusProps["game"];
  onMenu: MenusProps["onMenu"];
  onStart: MenusProps["onStart"];
  onUpdateTimeAllowed: MenusProps["onUpdateTimeAllowed"];
  setGame: MenusProps["setGame"];
};

export type MainMenuProps = {
  game: MenusProps["game"];
  onConfig: () => void;
  onStart: MenusProps["onStart"];
};

export type GameOverMenuProps = {
  game: MenusProps["game"];
  onContinue: MenusProps["onContinue"];
  onMenu: MenusProps["onMenu"];
};

export type ConnectMenuProps = {
  blocks: MenusProps["blocks"];
  game: MenusProps["game"];
  onConnect: MenusProps["onConnect"];
};

export type ResultMenuProps = {
  blocks: MenusProps["blocks"];
  game: MenusProps["game"];
  setGame: MenusProps["setGame"];
};
