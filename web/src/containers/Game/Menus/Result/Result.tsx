import type { SetStateAction } from "react";

import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import dayjs from "dayjs";
import Link from "next/link";
import { IoCheckbox, IoCopy } from "react-icons/io5";

import { GameChallengerResults } from "@/components/GameChallengerResults";
import { GameMenuCard } from "@/components/GameMenuCard";
import { LikeButton } from "@/components/LikeButton";
import useClipboard from "@/hooks/useClipboard";
import usePuzzleLike from "@/hooks/usePuzzleLike";
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from "@/lib/puzzleConnection";
import { generateQueryKey, queryKeys } from "@/lib/queryKeys";
import type { Game } from "@/types/game";

import Attempts from "./Attempts";
import Guesses from "./Guesses";
import Overview from "./Overview";
import type { ResultMenuProps } from "../../types";

function Result(props: ResultMenuProps) {
  const { blocks, game, setGame } = props;
  const {
    attempts,
    completedAt,
    config,
    challengeCode,
    challengedBy,
    puzzle,
    results,
    score,
    startedAt,
  } = game;
  const { groups } = puzzle;

  const { mutate } = usePuzzleLike();
  const queryClient = useQueryClient();
  const { hasCopied, onCopy } = useClipboard(
    `${process.env.NEXT_PUBLIC_HOST_URL}/games/challenge/${challengeCode}`,
    3000
  );

  return (
    <GameMenuCard>
      <div className="flex w-full items-center justify-between gap-6">
        <div className="flex w-full flex-col items-start justify-center">
          <h3 className="line-clamp-1 text-ellipsis font-heading text-sm font-bold leading-tight">
            {puzzle.name}
          </h3>

          <Link
            className={clsx(
              "text-sm font-semibold leading-tight text-subtle outline-none",

              "focus-visible:ring"
            )}
            href={`/users/${puzzle.createdBy.username}`}
          >
            {puzzle.createdBy.username}
          </Link>
        </div>

        <LikeButton
          isLiked={!!puzzle.likedAt}
          numOfLikes={puzzle.numOfLikes}
          onLike={async () => {
            const now = dayjs().tz().toDate();
            const action: SetStateAction<Game> = (prev) => ({
              ...prev,
              puzzle: {
                ...prev.puzzle,
                likedAt: prev.puzzle.likedAt ? null : now,
                numOfLikes: prev.puzzle.likedAt
                  ? prev.puzzle.numOfLikes - 1
                  : prev.puzzle.numOfLikes + 1,
              },
            });
            setGame(action);

            mutate(puzzle, {
              onError: () => {
                setGame(action);
              },
              onSuccess: async () => {
                const toggleMostPlayed = toggleLikePuzzleConnection(
                  puzzle.id,
                  queryClient,
                  {
                    exact: true,
                    queryKey: generateQueryKey.PuzzlesMostPlayed(),
                  }
                );
                const togglePuzzleCreated = toggleLikePuzzlePages(
                  puzzle.id,
                  queryClient,
                  {
                    exact: true,
                    queryKey: generateQueryKey.PuzzlesCreated(
                      puzzle.createdBy.id
                    ),
                  }
                );
                const togglePuzzles = toggleLikePuzzlePages(
                  puzzle.id,
                  queryClient,
                  {
                    exact: false,
                    queryKey: queryKeys.PuzzlesList,
                  }
                );

                await Promise.all([
                  toggleMostPlayed,
                  togglePuzzleCreated,
                  togglePuzzles,
                ]);
              },
            });
          }}
        />
      </div>

      <button
        aria-label="Copy challenge code"
        className={clsx(
          "relative mt-4 flex h-8 w-full shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border bg-cyan px-3 text-sm font-semibold text-surface outline-none transition",

          "focus-visible:ring focus-visible:ring-cyan",
          "hover:bg-cyan/70"
        )}
        onClick={() => onCopy()}
      >
        {hasCopied ? <IoCheckbox /> : <IoCopy />}
        {hasCopied ? "Copied!" : "Challenge your friends."}
      </button>

      {!!challengedBy && (
        <>
          <hr className="my-4 h-[1px] w-full bg-muted/20" />

          <GameChallengerResults
            attempts={challengedBy.attempts}
            maxAttempts={config.maxAttempts}
            maxScore={groups.length * 2}
            score={challengedBy.score}
            user={challengedBy.user}
          />

          <hr className="my-4 h-[1px] w-full bg-muted/20" />
        </>
      )}

      <div className="mt-4 flex w-full flex-col items-center justify-center gap-4">
        <Overview
          completedAt={completedAt}
          puzzle={puzzle}
          score={score}
          startedAt={startedAt}
        />

        <Attempts attempts={attempts} blocks={blocks} />

        <Guesses blocks={blocks} puzzle={puzzle} results={results} />

        <Link
          href="/puzzles"
          className={clsx(
            "relative flex h-10 w-full select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-cyan px-4 font-semibold text-surface outline-none transition",

            "active:bg-cyan/70",
            "focus-visible:ring focus-visible:ring-cyan/60",
            "hover:bg-cyan/70"
          )}
        >
          Back to Puzzles
        </Link>
      </div>
    </GameMenuCard>
  );
}

export default Result;
