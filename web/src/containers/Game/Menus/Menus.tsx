import { useMemo } from 'react';

import { Box, Portal, useDisclosure } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

import { MenusProps } from '../types';
import Config from './Config';
import Connect from './Connect';
import GameOver from './GameOver';
import MainMenu from './MainMenu';
import Result from './Result';

const Menus = (props: MenusProps) => {
  const {
    blocks,
    game,
    gridRef,
    isGameOver,
    onMenu,
    onStart,
    onConnect,
    onContinue,
    onUpdateTimeAllowed,
    setGame,
  } = props;
  const { completedAt, guessedAt, startedAt } = game;

  const { isOpen, onClose, onOpen } = useDisclosure();

  const Menu = useMemo(() => {
    if (isOpen) {
      return (
        <Config
          key="Game.ConfigMenu"
          game={game}
          setGame={setGame}
          onUpdateTimeAllowed={onUpdateTimeAllowed}
          onMenu={() => {
            onMenu();
            onClose();
          }}
          onStart={() => {
            onStart();
            onClose();
          }}
        />
      );
    }
    if (!startedAt) {
      return (
        <MainMenu
          key="Game.MainMenu"
          game={game}
          onStart={onStart}
          onConfig={() => onOpen()}
        />
      );
    }
    if (isGameOver) {
      return (
        <GameOver
          key="Game.GameOverMenu"
          game={game}
          onMenu={onMenu}
          onContinue={onContinue}
        />
      );
    }
    if (completedAt) {
      return (
        <Result
          key="Game.ResultMenu"
          game={game}
          blocks={blocks}
          setGame={setGame}
        />
      );
    }
    if (guessedAt) {
      return (
        <Connect
          key="Game.ConnectMenu"
          game={game}
          blocks={blocks}
          onConnect={onConnect}
        />
      );
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, game, isGameOver, isOpen]);

  return (
    <Portal containerRef={gridRef}>
      <AnimatePresence>
        {(isGameOver || guessedAt || !startedAt || completedAt) && (
          <Box
            top="0"
            w="100%"
            h="100%"
            bg="background"
            as={motion.div}
            position="absolute"
            // For AnimatePresence
            key="Game.MenuOverlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 0.6,
              transition: {
                duration: 0.4,
              },
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.4,
              },
            }}
          />
        )}
        {Menu}
      </AnimatePresence>
    </Portal>
  );
};

export default Menus;
