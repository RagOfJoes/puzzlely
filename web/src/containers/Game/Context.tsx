import type { PropsWithChildren } from "react";
import { useContext, createContext, useRef } from "react";

import { useStore } from "zustand";

import createGameStore from "./store";
import type { GameContainerProps, GameState, GameStore } from "./types";

export const GameContext = createContext<GameStore | null>(null);

export function GameProvider(props: PropsWithChildren<GameContainerProps>) {
  const { children } = props;

  const storeRef = useRef<GameStore>();
  if (!storeRef.current) {
    storeRef.current = createGameStore(props);
  }

  return (
    <GameContext.Provider value={storeRef.current}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameCtx<T>(
  selector: (state: GameState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(GameContext);
  if (!store) {
    throw new Error(
      "useGameCtx returned `undefined`. Must wrap component within GameProvider"
    );
  }

  return useStore(store, selector, equalityFn);
}
