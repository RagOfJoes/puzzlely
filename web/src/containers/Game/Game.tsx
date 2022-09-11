import { useMemo, useRef, useState } from 'react';

import { Box, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import shuffle from 'lodash.shuffle';

import useGameBlockSelect from '@/hooks/useGameBlockSelect';
import useGameConnect from '@/hooks/useGameConnect';
import useGameContinue from '@/hooks/useGameContinue';
import useGameForfeit from '@/hooks/useGameForfeit';
import useGameMenu from '@/hooks/useGameMenu';
import useGameReset from '@/hooks/useGameReset';
import useGameShuffle from '@/hooks/useGameShuffle';
import useGameStart from '@/hooks/useGameStart';
import useGameWrong from '@/hooks/useGameWrong';
import useMount from '@/hooks/useMount';
import useTimer from '@/hooks/useTimer';
import { millisecondsTo } from '@/lib/time';
import { Game } from '@/types/game';
import { Block } from '@/types/puzzle';

import Grid from './Grid';
import Menus from './Menus';
import Stats from './Stats';
import { GameContainerProps } from './types';

const GameContainer = (props: GameContainerProps) => {
  // Ref for placing Menus portal into Grid
  // This is useful for optimizing Grid when user is messing with Game configs, etc.
  const gridRef = useRef(null);

  /**
   * States
   */

  const [blocks, setBlocks] = useState(
    props.game.puzzle.groups.flatMap((g) => g.blocks)
  );
  const [correct, setCorrect] = useState<Game['correct']>(() => {
    // If guessedAt is already set then set all Groups (Ordered by correctly guessed first)
    // Otherwise, return an empty array
    if (props.game.startedAt && props.game.guessedAt) {
      const initial = [...props.game.correct];
      blocks.forEach((block) => {
        if (!initial.includes(block.groupID)) {
          initial.push(block.groupID);
        }
      });
      return initial;
    }
    return [];
  });
  const [selected, setSelected] = useState<Block[]>([]);
  const [isGameOver, toggleIsGameOver] = useState(false);
  const [isWrong, toggleIsWrong] = useState(false);

  const [game, setGame] = useState<Game>(props.game);
  const { completedAt, config, guessedAt, puzzle, startedAt } = game;
  const { timeAllowed } = config;

  /**
   * Timer
   */

  const startTime = useMemo(() => {
    if (startedAt && guessedAt) {
      return timeAllowed - dayjs(guessedAt).tz().diff(dayjs(startedAt).tz());
    }
    return timeAllowed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeAllowed]);
  const { pause, reset, resetTo, start, status, time } = useTimer({
    autostart: false,
    endTime: 0,
    interval: 1000,
    startTime,
    step: 1000,
    timerType: 'DECREMENTAL',
    onTimeOver: () => {
      // Make sure that guessedAt is within timeAllowed
      const newGuessedAt = dayjs(startedAt)
        .tz()
        .add(timeAllowed, 'milliseconds')
        .toDate();
      setGame((prev) => ({
        ...prev,
        guessedAt: newGuessedAt,
      }));

      toggleIsGameOver(true);
    },
  });
  const isRunning = useMemo(() => status === 'RUNNING', [status]);
  const { minutes, seconds } = useMemo(
    () => ({
      minutes: millisecondsTo('minutes', time),
      seconds: millisecondsTo('seconds', time),
    }),
    [time]
  );

  /**
   * Side Effects
   */

  // On mount:
  // - If continuing, then, order blocks by correct guessed first
  // - Else, shuffle blocks
  useMount(() => {
    if (props.game.startedAt && props.game.guessedAt) {
      const map: { [key: string]: Block[] } = {};
      correct.forEach((id) => {
        if (!map[id]) {
          map[id] = blocks.filter((block) => block.groupID === id);
        }
      });
      setBlocks(Object.values(map).flat());
      return;
    }

    setBlocks(shuffle(props.game.puzzle.groups.flatMap((g) => g.blocks)));
  });
  useGameWrong({ isWrong, setSelected, toggleIsWrong });

  /**
   * Callbacks
   */

  const onBlockSelect = useGameBlockSelect({
    blocks,
    correct,
    game,
    isGameOver,
    isWrong,
    pause,
    selected,
    startedAt,
    setBlocks,
    setCorrect,
    setGame,
    setSelected,
    toggleIsGameOver,
    toggleIsWrong,
  });
  const onConnect = useGameConnect({
    game,
    setGame,
  });
  const onContinue = useGameContinue({
    blocks,
    correct,
    game,
    isGameOver,
    setBlocks,
    setCorrect,
    setSelected,
    toggleIsGameOver,
    toggleIsWrong,
  });
  const onForfeit = useGameForfeit({
    blocks,
    correct,
    game,
    isGameOver,
    pause,
    setBlocks,
    setCorrect,
    setGame,
    setSelected,
    toggleIsGameOver,
    toggleIsWrong,
  });
  const onMenu = useGameMenu({
    blocks,
    startedAt,
    timeAllowed,
    reset,
    setBlocks,
    setCorrect,
    setGame,
    setSelected,
    toggleIsGameOver,
  });
  const onReset = useGameReset({
    blocks,
    completedAt,
    guessedAt,
    reset,
    setBlocks,
    setCorrect,
    setGame,
    setSelected,
    start,
    startedAt,
    timeAllowed,
  });
  const onShuffle = useGameShuffle({
    blocks,
    completedAt,
    correct,
    guessedAt,
    startedAt,
    setBlocks,
  });
  const onStart = useGameStart({
    isRunning,
    setGame,
    start,
    startedAt,
    timeAllowed,
  });

  /**
   * Render
   */

  return (
    <Box w="100%" display="flex" justifyContent="center">
      <VStack w="100%" spacing="3" maxW="container.md">
        {/* Game stats */}
        <Stats
          game={game}
          minutes={minutes}
          seconds={seconds}
          onReset={onReset}
          onShuffle={onShuffle}
          onForfeit={onForfeit}
        />
        {/* Game grid */}
        <Grid
          ref={gridRef}
          blocks={blocks}
          correct={correct}
          isWrong={isWrong}
          selected={selected}
          isGameOver={isGameOver}
          game={{ startedAt: game.startedAt }}
          onBlockSelect={onBlockSelect}
        />
        {/* Game menu cards */}
        <Menus
          blocks={blocks}
          gridRef={gridRef}
          isGameOver={isGameOver}
          // States
          game={{
            id: game.id,
            score: game.score,
            config: game.config,
            results: game.results,
            correct: game.correct,
            attempts: game.attempts,
            guessedAt: game.guessedAt,
            startedAt: game.startedAt,
            challengedBy: game.challengedBy,
            challengeCode: game.challengeCode,
            completedAt: game.completedAt,
            puzzle: {
              id: puzzle.id,
              name: puzzle.name,
              groups: puzzle.groups,
              likedAt: puzzle.likedAt,
              createdAt: puzzle.createdAt,
              createdBy: puzzle.createdBy,
              difficulty: puzzle.difficulty,
              numOfLikes: puzzle.numOfLikes,
              maxAttempts: puzzle.maxAttempts,
              timeAllowed: puzzle.timeAllowed,
            },
          }}
          setGame={setGame}
          // Callbacks
          onMenu={onMenu}
          onStart={onStart}
          onConnect={onConnect}
          onContinue={onContinue}
          onUpdateTimeAllowed={(newTime) => {
            if (!isRunning && !startedAt) {
              resetTo(newTime, false);
            }
          }}
        />
      </VStack>
    </Box>
  );
};

export default GameContainer;
