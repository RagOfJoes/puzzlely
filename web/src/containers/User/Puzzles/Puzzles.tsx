import { useMemo } from 'react';

import { Grid, GridItem, Heading } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';

import PuzzleCard from '@/components/PuzzleCard';
import Waypoint from '@/components/Waypoint';
import useMe from '@/hooks/useMe';
import usePuzzleLike from '@/hooks/usePuzzleLike';
import usePuzzlesCreated from '@/hooks/usePuzzlesCreated';
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from '@/lib/puzzleConnection';
import { generateQueryKey, queryKeys } from '@/lib/queryKeys';
import { PuzzleConnection, PuzzleEdge } from '@/types/puzzle';
import { User } from '@/types/user';

import Loading from './Loading';

type PuzzlesProps = {
  user: User;
};

const Puzzles = (props: PuzzlesProps) => {
  const { user } = props;

  const { data: me } = useMe();
  const { mutate } = usePuzzleLike();
  const queryClient = useQueryClient();
  const {
    data: puzzles,
    fetchNextPage,
    hasNextPage,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = usePuzzlesCreated(user.id);

  const connection: PuzzleConnection = useMemo(() => {
    if (!puzzles || puzzles.pages.length === 0) {
      return {
        edges: [],
        pageInfo: {
          cursor: '',
          hasNextPage: false,
        },
      };
    }

    const pageInfo: PuzzleConnection['pageInfo'] = puzzles.pages[
      puzzles.pages.length - 1
    ]?.pageInfo || { cursor: '', hasNextPage: false };
    const edges: PuzzleEdge[] = puzzles.pages
      .filter((page) => page.edges.length > 0)
      .flatMap((page) => page.edges);

    return {
      edges,
      pageInfo,
    };
  }, [puzzles]);

  if (connection.edges.length === 0 && isFetched) {
    return (
      <Heading size="sm" color="text.secondary">
        No puzzles created.
      </Heading>
    );
  }

  return (
    <Grid
      gap="4"
      w="100%"
      templateColumns={{
        base: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        xl: 'repeat(3, 1fr)',
      }}
    >
      {!isFetched && isLoading && <Loading />}

      {isFetched &&
        puzzles &&
        puzzles.pages.length > 0 &&
        connection.edges.map((edge) => {
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
                    exact: true,
                    queryKey: generateQueryKey.PuzzlesCreated(user.id),
                  });

                  mutate(node, {
                    onError: async () => {
                      await toggleLikePuzzlePages(node.id, queryClient, {
                        exact: true,
                        queryKey: generateQueryKey.PuzzlesCreated(user.id),
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
                      const togglePuzzles = toggleLikePuzzlePages(
                        node.id,
                        queryClient,
                        {
                          exact: false,
                          queryKey: queryKeys.PuzzlesList,
                        }
                      );

                      await Promise.all([toggleMostPlayed, togglePuzzles]);
                    },
                  });
                }}
              />
            </GridItem>
          );
        })}

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
    </Grid>
  );
};

export default Puzzles;
