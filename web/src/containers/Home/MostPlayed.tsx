import { useMemo } from "react";

import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import dayjs from "dayjs";

import { PuzzleCard } from "@/components/PuzzleCard";
import { Skeleton } from "@/components/Skeleton";
import useMe from "@/hooks/useMe";
import usePuzzleLike from "@/hooks/usePuzzleLike";
import usePuzzlesMostPlayed from "@/hooks/usePuzzlesMostPlayed";
import { LOADING_DATE_PLACEHOLDER } from "@/lib/constants";
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from "@/lib/puzzleConnection";
import { generateQueryKey, queryKeys } from "@/lib/queryKeys";
import type { PuzzleConnection } from "@/types/puzzle";

const NUM_OF_ITEMS = 6;

function MostPlayed() {
  const { data: me } = useMe();
  const { mutate } = usePuzzleLike();
  const queryClient = useQueryClient();
  const { data, isFetched, isLoading } = usePuzzlesMostPlayed();

  const loadingTime = useMemo(
    () => dayjs(LOADING_DATE_PLACEHOLDER).tz().toDate(),
    []
  );

  return (
    <section className="mt-10">
      <h2 className="font-heading text-xl font-bold">Most Played Puzzles</h2>

      <div
        className={clsx(
          "mt-5 grid grid-cols-3 gap-4",

          "max-xl:grid-cols-2",
          "max-md:grid-cols-1"
        )}
      >
        {data &&
          data.edges.length > 0 &&
          isFetched &&
          !isLoading &&
          data.edges.map((edge, index) => {
            if (index >= NUM_OF_ITEMS) {
              return null;
            }

            const { cursor, node } = edge;

            return (
              <div
                key={`PuzzlesMostPlayed__Puzzle__${cursor}`}
                className="col-span-1 row-span-1"
              >
                <PuzzleCard
                  createdAt={node.createdAt}
                  createdBy={node.createdBy.username}
                  difficulty={node.difficulty}
                  id={node.id}
                  isEditable={node.createdBy.id === me?.id}
                  likedAt={node.likedAt}
                  maxAttempts={node.maxAttempts}
                  name={node.name}
                  numOfLikes={node.numOfLikes}
                  onLike={async () => {
                    const key = generateQueryKey.PuzzlesMostPlayed();

                    // Snapshot the previous value
                    const previous = queryClient.getQueryData<
                      PuzzleConnection | undefined
                    >(key);

                    await toggleLikePuzzleConnection(node.id, queryClient, {
                      exact: true,
                      queryKey: key,
                    });

                    mutate(node, {
                      onError: async () => {
                        queryClient.setQueryData<PuzzleConnection | undefined>(
                          key,
                          previous
                        );
                      },
                      onSuccess: async () => {
                        const togglePuzzleCreated = toggleLikePuzzlePages(
                          node.id,
                          queryClient,
                          {
                            exact: true,
                            queryKey: generateQueryKey.PuzzlesCreated(
                              node.createdBy.id
                            ),
                          }
                        );
                        const togglePuzzles = toggleLikePuzzlePages(
                          node.id,
                          queryClient,
                          {
                            exact: false,
                            queryKey: queryKeys.PuzzlesList,
                          }
                        );

                        await Promise.all([togglePuzzleCreated, togglePuzzles]);
                      },
                    });
                  }}
                  timeAllowed={node.timeAllowed}
                />
              </div>
            );
          })}

        {isLoading &&
          Array.from({ length: NUM_OF_ITEMS }).map((_, index) => (
            <Skeleton key={`PuzzlesMostPlayed__Loading__${index}`}>
              <div className="invisible col-span-1 row-span-1">
                <PuzzleCard
                  createdAt={loadingTime}
                  createdBy="Lorem"
                  difficulty="Easy"
                  id=""
                  maxAttempts={0}
                  name="Puzzle Name"
                  numOfLikes={0}
                  timeAllowed={0}
                />
              </div>
            </Skeleton>
          ))}
      </div>
    </section>
  );
}

export default MostPlayed;
