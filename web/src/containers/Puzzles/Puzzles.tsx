import { useMemo, useState } from "react";

import type { QueryKey } from "@tanstack/react-query";
import clsx from "clsx";

import { Waypoint } from "@/components/Waypoint";
import usePuzzles from "@/hooks/usePuzzles";
import { generateQueryKey } from "@/lib/queryKeys";
import type {
  PuzzleConnection,
  PuzzleEdge,
  PuzzleFilters,
} from "@/types/puzzle";

import Cards from "./Cards";
import Filter from "./Filter";
import Loading from "./Loading";

export function PuzzlesContainer() {
  const [filters, setFilters] = useState<{
    [key in PuzzleFilters]?: string;
  }>({});
  const [queryKey, setQueryKey] = useState<QueryKey>(
    generateQueryKey.PuzzlesList(filters)
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = usePuzzles(queryKey, { filters });

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
          <Filter
            filters={filters}
            queryKey={queryKey}
            setFilters={setFilters}
            setQueryKey={setQueryKey}
          />
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
