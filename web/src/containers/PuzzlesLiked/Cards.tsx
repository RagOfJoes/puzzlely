import { PuzzleCard } from "@/components/PuzzleCard";
import useMe from "@/hooks/useMe";
import type { PuzzleEdge } from "@/types/puzzle";

import { usePuzzleLike } from "./utils";

function Cards(props: { edges: PuzzleEdge[] }) {
  const { edges } = props;

  const { data: me } = useMe();
  const { mutate } = usePuzzleLike();

  return (
    <>
      {edges.map((edge) => {
        const { cursor, node } = edge;

        if (!node.likedAt) {
          return null;
        }

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
              onLike={() => mutate(node)}
              timeAllowed={node.timeAllowed}
            />
          </div>
        );
      })}
    </>
  );
}

export default Cards;
