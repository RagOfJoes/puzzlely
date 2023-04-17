import clsx from "clsx";

import { PuzzleItem } from "@/components/PuzzleItem";
import { Skeleton } from "@/components/Skeleton";
import usePuzzlesMostLiked from "@/hooks/usePuzzlesMostLiked";

const NUM_OF_ITEMS = 6;

function MostLiked() {
  const { data, isFetched, isLoading } = usePuzzlesMostLiked();

  return (
    <section className="mt-10 rounded-md border bg-surface p-6">
      <h2 className="font-heading text-xl font-bold">Most Liked Puzzles</h2>

      <div
        className={clsx(
          "mt-5 grid grid-cols-3 gap-8",

          "max-xl:grid-cols-2 max-md:gap-6",
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
                key={`PuzzlesMostLiked__Puzzle__${cursor}`}
                className="col-span-1 row-span-1"
              >
                <PuzzleItem
                  createdBy={node.createdBy.username}
                  difficulty={node.difficulty}
                  id={node.id}
                  maxAttempts={node.maxAttempts}
                  name={node.name}
                  timeAllowed={node.timeAllowed}
                />
              </div>
            );
          })}

        {isLoading &&
          Array.from({ length: NUM_OF_ITEMS }).map((_, index) => (
            <Skeleton key={`PuzzlesMostLiked__Loading__${index}`}>
              <div className="invisible col-span-1 row-span-1">
                <PuzzleItem
                  createdBy="Lorem"
                  difficulty="Easy"
                  id=""
                  maxAttempts={0}
                  name="Lorem"
                  timeAllowed={0}
                />
              </div>
            </Skeleton>
          ))}
      </div>
    </section>
  );
}

export default MostLiked;
