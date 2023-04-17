import { useMemo } from "react";

import clsx from "clsx";

import { GameCard } from "@/components/GameCard";
import { Waypoint } from "@/components/Waypoint";
import useGameHistory from "@/hooks/useGameHistory";
import useMe from "@/hooks/useMe";
import type { GameConnection, GameEdge } from "@/types/game";
import type { User } from "@/types/user";

import Loading from "./Loading";

function Games(props: { user: User }) {
  const { user } = props;

  const { data: me } = useMe();
  const {
    data: games,
    fetchNextPage,
    hasNextPage,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = useGameHistory(user.id);

  const connection: GameConnection = useMemo(() => {
    if (!games || games.pages.length === 0) {
      return {
        edges: [],
        pageInfo: {
          cursor: "",
          hasNextPage: false,
        },
      };
    }

    const pageInfo: GameConnection["pageInfo"] = games.pages[
      games.pages.length - 1
    ]?.pageInfo || { cursor: "", hasNextPage: false };
    const edges: GameEdge[] = [];
    games.pages.forEach((page) => {
      if (page.edges.length > 0) {
        edges.push(...page.edges);
      }
    });
    return {
      edges,
      pageInfo,
    };
  }, [games]);

  if (connection.edges.length === 0 && isFetched) {
    return (
      <h3 className="px-5 font-heading font-bold text-subtle">
        No games played.
      </h3>
    );
  }

  return (
    <div
      className={clsx(
        "grid w-full grid-cols-3 gap-4",

        "max-xl:grid-cols-2",
        "max-md:grid-cols-1"
      )}
    >
      {!isFetched && isLoading && <Loading />}

      {isFetched &&
        games &&
        games.pages.length > 0 &&
        connection.edges.map((edge) => {
          const { cursor, node } = edge;

          const isPlayable = me?.id !== user.id;

          return (
            <div key={cursor} className="col-span-1 row-span-1">
              <GameCard
                attempts={node.attempts}
                challengeCode={node.challengeCode}
                completedAt={node.completedAt!}
                createdBy={node.puzzle.createdBy.username}
                difficulty={node.puzzle.difficulty}
                id={node.id}
                isPlayable={isPlayable}
                maxAttempts={node.config.maxAttempts}
                maxScore={8}
                name={node.puzzle.name}
                score={node.score}
                startedAt={node.startedAt!}
                timeAllowed={node.config.timeAllowed}
              />
            </div>
          );
        })}

      {isFetched && isFetchingNextPage && <Loading />}

      {hasNextPage && isFetched && !isLoading && (
        <Waypoint
          initialInView={false}
          onChange={(inView) => {
            if (inView) {
              fetchNextPage();
            }
          }}
        />
      )}
    </div>
  );
}

export default Games;
