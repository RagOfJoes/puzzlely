import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import dayjs from "dayjs";

import { PuzzleCard } from "@/components/PuzzleCard";
import useMe from "@/hooks/useMe";
import usePuzzleLike from "@/hooks/usePuzzleLike";
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from "@/lib/puzzleConnection";
import { generateQueryKey, queryKeys } from "@/lib/queryKeys";
import type { PuzzleConnection } from "@/types/puzzle";

import type { SearchContainerProps } from "./types";

export function SearchContainer(props: SearchContainerProps) {
  const { result, search } = props;

  const { data: me } = useMe();
  const { mutate } = usePuzzleLike();
  const queryClient = useQueryClient();

  const isPlural = result.edges.length === 0 || result.edges.length > 1;

  return (
    <article>
      <div className="flex w-full flex-col gap-6">
        <section className="w-full">
          <div className="flex flex-col items-start gap-1">
            <h2 className="font-heading text-xl font-bold">
              Search {isPlural ? "Results" : "Result"} for &quot;{search}&quot;
            </h2>

            <p className="font-medium text-subtle">
              {result.edges.length} {isPlural ? "results" : "result"}
            </p>
          </div>
        </section>

        <section className="w-full">
          <div
            className={clsx(
              "grid w-full grid-cols-3 gap-4",

              "max-xl:grid-cols-2",
              "max-md:grid-cols-1"
            )}
          >
            {result.edges.map((edge) => {
              const { cursor, node } = edge;

              return (
                <div key={cursor} className="col-span-1 row-span-1">
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
                      const key = generateQueryKey.Search(search);

                      // Cancel any outgoing refetches so they don't overwrite our optimistic update
                      await queryClient.cancelQueries(key);
                      // Snapshot the previous value
                      const previous = queryClient.getQueryData<
                        PuzzleConnection | undefined
                      >(key);

                      queryClient.setQueryData<PuzzleConnection | undefined>(
                        key,
                        (old) => {
                          if (!old) {
                            return old;
                          }

                          const now = dayjs().tz().toDate();
                          const newEdges = old.edges.map((e) => {
                            if (e.node.id === node.id) {
                              return {
                                ...e,
                                node: {
                                  ...e.node,
                                  likedAt: e.node.likedAt ? null : now,
                                  numOfLikes: e.node.likedAt
                                    ? e.node.numOfLikes - 1
                                    : e.node.numOfLikes + 1,
                                },
                              };
                            }
                            return e;
                          });

                          return { ...old, edges: newEdges };
                        }
                      );

                      mutate(node, {
                        onError: async () => {
                          queryClient.setQueryData<
                            PuzzleConnection | undefined
                          >(key, previous);
                        },
                        onSuccess: async () => {
                          const toggleMostPlayed = toggleLikePuzzleConnection(
                            node.id,
                            queryClient,
                            {
                              exact: true,
                              queryKey: generateQueryKey.PuzzlesMostPlayed(),
                            }
                          );
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

                          await Promise.all([
                            toggleMostPlayed,
                            togglePuzzleCreated,
                            togglePuzzles,
                          ]);
                        },
                      });
                    }}
                    timeAllowed={node.timeAllowed}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </article>
  );
}
