import { useMemo } from 'react';

import { Box, Grid, GridItem, Heading, Skeleton } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import PuzzleCard from '@/components/PuzzleCard';
import useMe from '@/hooks/useMe';
import usePuzzleLike from '@/hooks/usePuzzleLike';
import usePuzzlesMostPlayed from '@/hooks/usePuzzlesMostPlayed';
import { LOADING_DATE_PLACEHOLDER } from '@/lib/constants';
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from '@/lib/puzzleConnection';
import { generateQueryKey, queryKeys } from '@/lib/queryKeys';
import { PuzzleConnection } from '@/types/puzzle';

const NUM_OF_ITEMS = 6;

const MostPlayed = () => {
  const { data: me } = useMe();
  const { mutate } = usePuzzleLike();
  const queryClient = useQueryClient();
  const { data, isFetched, isLoading } = usePuzzlesMostPlayed();

  const loadingTime = useMemo(
    () => dayjs(LOADING_DATE_PLACEHOLDER).tz().toDate(),
    []
  );

  return (
    <Box mt="10" as="section">
      <Heading size="md">Most Played Puzzles</Heading>

      <Grid
        mt="5"
        gap="4"
        templateColumns={{
          base: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
          xl: 'repeat(3, 1fr)',
        }}
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
              <GridItem
                colSpan={1}
                rowSpan={1}
                key={`PuzzlesMostPlayed__Puzzle_${cursor}`}
              >
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
                    const key = generateQueryKey.PuzzlesMostPlayed();

                    // Snapshot the previous value
                    const previous = queryClient.getQueryData<
                      PuzzleConnection | undefined
                    >(key);

                    await toggleLikePuzzleConnection(node.id, queryClient, {
                      exact: true,
                      queryKey: key,
                    });

                    mutate(node, {
                      onError: async () => {
                        queryClient.setQueryData<PuzzleConnection | undefined>(
                          key,
                          previous
                        );
                      },
                      onSuccess: async () => {
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

                        await Promise.all([togglePuzzleCreated, togglePuzzles]);
                      },
                    });
                  }}
                />
              </GridItem>
            );
          })}

        {isLoading &&
          Array.from({ length: NUM_OF_ITEMS }).map((_, index) => (
            <Skeleton key={`PuzzlesMostPlayed__Loading__${index}`}>
              <GridItem colSpan={1} rowSpan={1}>
                <PuzzleCard
                  id=""
                  numOfLikes={0}
                  maxAttempts={0}
                  timeAllowed={0}
                  difficulty="Easy"
                  createdBy="Lorem"
                  name="Puzzle Name"
                  createdAt={loadingTime}
                />
              </GridItem>
            </Skeleton>
          ))}
      </Grid>
    </Box>
  );
};

export default MostPlayed;
