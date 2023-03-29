import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import dayjs from "dayjs";

import useGameGuess from "@/hooks/useGameGuess";
import { UNLIMITED_MAX_ATTEMPTS } from "@/lib/constants";
import groupBy from "@/lib/groupBy";
import uniqueBy from "@/lib/uniqueBy";
import type { Game } from "@/types/game";
import type { Block } from "@/types/puzzle";

export type UseGameBlockSelectParam = {
  blocks: Block[];
  correct: Game["correct"];
  game: Game;
  isGameOver: boolean;
  isWrong: boolean;
  pause: () => void;
  selected: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  setCorrect: Dispatch<SetStateAction<Game["correct"]>>;
  setGame: Dispatch<SetStateAction<Game>>;
  setSelected: Dispatch<SetStateAction<Block[]>>;
  startedAt: Game["startedAt"];
  toggleIsGameOver: Dispatch<SetStateAction<boolean>>;
  toggleIsWrong: Dispatch<SetStateAction<boolean>>;
};

/**
 * When User selects a Block
 */
function useGameBlockSelect(args: UseGameBlockSelectParam) {
  const {
    blocks,
    correct,
    game,
    isGameOver,
    isWrong,
    pause,
    selected,
    setBlocks,
    setCorrect,
    setGame,
    setSelected,
    startedAt,
    toggleIsGameOver,
    toggleIsWrong,
  } = args;
  const {
    attempts,
    completedAt,
    config,
    guessedAt,
    id,
    puzzle,
    results,
    score,
  } = game;
  const { maxAttempts } = config;

  const { mutate } = useGameGuess(id);

  return useCallback(
    (block: Block, isCorrect: boolean, isSelected: boolean) => {
      // Timestamp for `guessedAt` field
      const now = dayjs().tz().toDate();
      const groupID = block.groupID;

      // Make sure selection is valid
      const isNotPlaying = completedAt || guessedAt || isGameOver || !startedAt;
      const isTooMuchSelected = selected.length >= 4 && !isSelected;
      const isTooMuchAttempts =
        maxAttempts > 0 && attempts.length >= maxAttempts;
      if (
        isWrong ||
        isCorrect ||
        isNotPlaying ||
        isTooMuchAttempts ||
        isTooMuchSelected
      ) {
        return;
      }

      // If already selected then filter out of `selected` state
      if (isSelected) {
        setSelected((prev) =>
          [...prev].filter((select) => select.id !== block.id)
        );
        return;
      }

      // Clone `selected` then append Block to it
      const newSelected = [...selected, block];
      // Update `selected` state to trigger animation
      setSelected(newSelected);

      // If `selected` state isn't full yet then exit
      if (newSelected.length < 4) {
        return;
      }

      // If any of the Blocks are wrong
      if (newSelected.some((select) => select.groupID !== groupID)) {
        // Append `selected` state's IDs to Game's `attempts` field
        const newAttempts = [
          ...attempts,
          newSelected.map((select) => select.id),
        ];
        // Check if reached `maxAttempts`
        const isMaxAttempt =
          maxAttempts !== UNLIMITED_MAX_ATTEMPTS &&
          newAttempts.length >= maxAttempts;

        // If reached `maxAttempts`, then, pause timer first
        if (isMaxAttempt) {
          pause();
        }

        setGame((prev) => {
          const newGame = {
            ...prev,
            attempts: newAttempts,
          };

          // If reached `maxAttempts`, then, set `guessedAt`
          if (isMaxAttempt) {
            return {
              ...newGame,
              guessedAt: now,
            };
          }
          return newGame;
        });

        // Toggle `wrong` state to true to trigger animation
        toggleIsWrong(true);

        // If reached `maxAttempts`, then, toggle `isGameOver` state to true`
        if (isMaxAttempt) {
          toggleIsGameOver(true);
        }
        return;
      }

      // Clone `correct` state then append `groupID`
      const newCorrect = [...correct, groupID];

      // If User has linked all Groups correctly
      const isGuessedAll = newCorrect.length === puzzle.groups.length - 1;
      if (isGuessedAll) {
        // Append last `groupID` to cloned `correct` state
        const lastGroup = puzzle.groups
          .filter((g) => !newCorrect.includes(g.id))
          .map((g) => g.id);
        // Make sure there's only one group left also make typescript happy
        if (lastGroup.length === 1 && typeof lastGroup[0] === "string") {
          newCorrect.push(lastGroup[0]);
        }
      }

      // 1. Filter blocks so only blocks that belong to a correct group is returned
      // 2. Group by `groupID`
      // 3. Flatten array
      const grouped = groupBy(
        blocks.filter((b) => newCorrect.includes(b.groupID)),
        (b) => b.groupID
      ).flat();

      // 1. Order blocks by putting correctly guessed on top
      // 2. Remove duplicates
      const newBlocks = uniqueBy([...grouped, ...blocks], (item) => item.id);

      const newScore = isGuessedAll ? puzzle.groups.length : score + 1;
      // Update game state
      setCorrect(newCorrect);
      setGame((prev) => ({
        ...prev,
        correct: newCorrect,
        guessedAt: isGuessedAll ? now : null,
        score: newScore,
      }));

      // Update block states
      setSelected([]);
      setBlocks(newBlocks);

      if (isGuessedAll) {
        pause();

        mutate({
          game,
          update: {
            attempts,
            completedAt,
            config,
            correct: newCorrect,
            guessedAt: now,
            results,
            score: newScore,
            startedAt,
          },
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      attempts,
      blocks,
      config,
      correct,
      game.correct,
      guessedAt,
      isGameOver,
      isWrong,
      score,
      selected,
      startedAt,
    ]
  );
}

export default useGameBlockSelect;
