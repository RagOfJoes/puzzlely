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
              id={node.id}
              name={node.name}
              likedAt={node.likedAt}
              createdAt={node.createdAt}
              difficulty={node.difficulty}
              numOfLikes={node.numOfLikes}
              maxAttempts={node.maxAttempts}
              timeAllowed={node.timeAllowed}
              createdBy={node.createdBy.username}
              isEditable={node.createdBy.id === me?.id}
              onLike={() => mutate(node)}
            />
          </div>
        );
      })}
    </>
  );
}

export default Cards;
