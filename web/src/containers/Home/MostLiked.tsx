import clsx from "clsx";

import { PuzzleItem } from "@/components/PuzzleItem";
import { Skeleton } from "@/components/Skeleton";
import usePuzzlesMostLiked from "@/hooks/usePuzzlesMostLiked";

const NUM_OF_ITEMS = 6;

function MostLiked() {
  const { data, isFetched, isLoading } = usePuzzlesMostLiked();

  return (
    <section className="mt-10 rounded-md bg-surface p-6">
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
                className="col-span-1 row-span-1"
                key={`PuzzlesMostLiked__Puzzle__${cursor}`}
              >
                <PuzzleItem
                  id={node.id}
                  name={node.name}
                  difficulty={node.difficulty}
                  maxAttempts={node.maxAttempts}
                  timeAllowed={node.timeAllowed}
                  createdBy={node.createdBy.username}
                />
              </div>
            );
          })}

        {isLoading &&
          Array.from({ length: NUM_OF_ITEMS }).map((_, index) => (
            <Skeleton key={`PuzzlesMostLiked__Loading__${index}`}>
              <div className="invisible col-span-1 row-span-1">
                <PuzzleItem
                  id=""
                  name="Lorem"
                  maxAttempts={0}
                  timeAllowed={0}
                  difficulty="Easy"
                  createdBy="Lorem"
                />
              </div>
            </Skeleton>
          ))}
      </div>
    </section>
  );
}

export default MostLiked;
