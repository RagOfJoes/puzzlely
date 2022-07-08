import { memo } from 'react';

import { GridItem } from '@chakra-ui/react';
import { useQueryClient } from 'react-query';

import PuzzleCard from '@/components/PuzzleCard';
import useMe from '@/hooks/useMe';
import usePuzzleLike from '@/hooks/usePuzzleLike';
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from '@/lib/puzzleConnection';
import { generateQueryKey, queryKeys } from '@/lib/queryKeys';
import { PuzzleEdge } from '@/types/puzzle';

type CardProps = {
  edges: PuzzleEdge[];
};

const Cards = (props: CardProps) => {
  const { edges } = props;

  const { data: me } = useMe();
  const { mutate } = usePuzzleLike();
  const queryClient = useQueryClient();

  return (
    <>
      {edges.map((edge) => {
        const { cursor, node } = edge;
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
              onLike={async () => {
                await toggleLikePuzzlePages(node.id, queryClient, {
                  exact: false,
                  queryKey: queryKeys.PuzzlesList,
                });

                mutate(node, {
                  onError: async () => {
                    await toggleLikePuzzlePages(node.id, queryClient, {
                      exact: false,
                      queryKey: queryKeys.PuzzlesList,
                    });
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

                    await Promise.all([toggleMostPlayed, togglePuzzleCreated]);
                  },
                });
              }}
            />
          </GridItem>
        );
      })}
    </>
  );
};

export default memo(Cards);
