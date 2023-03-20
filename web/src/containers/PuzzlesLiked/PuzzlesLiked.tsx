import { useMemo } from "react";

import clsx from "clsx";

import Waypoint from "@/components/Waypoint";
import useMe from "@/hooks/useMe";
import usePuzzlesLiked from "@/hooks/usePuzzlesLiked";
import useUserStats from "@/hooks/useUserStats";
import type { PuzzleConnection, PuzzleEdge } from "@/types/puzzle";

import Cards from "./Cards";
import Loading from "./Loading";

export function PuzzlesLikedContainer() {
  const { data: me } = useMe();
  const { data: stats } = useUserStats(me!.id);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = usePuzzlesLiked();

  const connection: PuzzleConnection = useMemo(() => {
    if (!data || data.pages.length === 0) {
      return {
        edges: [],
        pageInfo: {
          cursor: "",
          hasNextPage: false,
        },
      };
    }

    const pageInfo: PuzzleConnection["pageInfo"] = data.pages[
      data.pages.length - 1
    ]?.pageInfo || { cursor: "", hasNextPage: false };
    const edges: PuzzleEdge[] = data.pages
      .filter((page) => page.edges.length > 0)
      .flatMap((page) => page.edges);

    return {
      edges,
      pageInfo,
    };
  }, [data]);

  return (
    <article>
      <div className="flex w-full flex-col items-start gap-6">
        <section className="w-full">
          <div className="flex w-full justify-between gap-2">
            <div className="flex flex-col items-start gap-1">
              <div className="flex items-center gap-1">
                <h2 className="font-heading text-xl font-bold">
                  Liked Puzzles
                </h2>
                <small className="text-sm font-medium text-subtle">
                  ({stats?.puzzlesLiked ?? 0})
                </small>
              </div>

              <p className="font-medium text-subtle">
                Sorted by recently liked.
              </p>
            </div>
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
            {!isFetched && isLoading && <Loading />}

            {isFetched && data && data.pages?.length > 0 && (
              <Cards edges={connection.edges} />
            )}

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
        </section>
      </div>
    </article>
  );
}

export default PuzzlesLikedContainer;
