import { memo } from 'react';

import { GridItem } from '@chakra-ui/react';

import PuzzleCard from '@/components/PuzzleCard';
import useMe from '@/hooks/useMe';
import { PuzzleEdge } from '@/types/puzzle';

import { usePuzzleLike } from './utils';

type CardProps = {
  edges: PuzzleEdge[];
};

const Cards = (props: CardProps) => {
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
          <GridItem colSpan={1} rowSpan={1} key={cursor}>
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
          </GridItem>
        );
      })}
    </>
  );
};

export default memo(Cards);
