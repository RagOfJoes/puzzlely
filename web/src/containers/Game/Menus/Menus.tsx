import { useMemo, useState } from "react";

import * as Portal from "@radix-ui/react-portal";
import { AnimatePresence } from "framer-motion";

import Config from "./Config";
import Connect from "./Connect";
import GameOver from "./GameOver";
import MainMenu from "./MainMenu";
import Result from "./Result";
import type { MenusProps } from "../types";

function Menus(props: MenusProps) {
  const {
    blocks,
    game,
    gridRef,
    isGameOver,
    onConnect,
    onContinue,
    onMenu,
    onStart,
    onUpdateTimeAllowed,
    setGame,
  } = props;
  const { completedAt, guessedAt, startedAt } = game;

  const [isOpen, toggleIsOpen] = useState(false);

  const Menu = useMemo(() => {
    if (isOpen) {
      return (
        <Config
          key="Game.ConfigMenu"
          game={game}
          onMenu={() => {
            onMenu();

            toggleIsOpen(false);
          }}
          onStart={() => {
            onStart();

            toggleIsOpen(false);
          }}
          onUpdateTimeAllowed={onUpdateTimeAllowed}
          setGame={setGame}
        />
      );
    }
    if (!startedAt) {
      return (
        <MainMenu
          key="Game.MainMenu"
          game={game}
          onConfig={() => toggleIsOpen(true)}
          onStart={onStart}
        />
      );
    }
    if (isGameOver) {
      return (
        <GameOver
          key="Game.GameOverMenu"
          game={game}
          onContinue={onContinue}
          onMenu={onMenu}
        />
      );
    }
    if (completedAt) {
      return (
        <Result
          key="Game.ResultMenu"
          blocks={blocks}
          game={game}
          setGame={setGame}
        />
      );
    }
    if (guessedAt) {
      return (
        <Connect
          key="Game.ConnectMenu"
          blocks={blocks}
          game={game}
          onConnect={onConnect}
        />
      );
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, game, isGameOver, isOpen]);

  return (
    <Portal.Root container={gridRef.current}>
      <AnimatePresence>{Menu}</AnimatePresence>
    </Portal.Root>
  );
}

export default Menus;
