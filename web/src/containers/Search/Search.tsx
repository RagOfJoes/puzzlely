import { Grid, GridItem, Heading, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useQueryClient } from 'react-query';

import PuzzleCard from '@/components/PuzzleCard';
import useMe from '@/hooks/useMe';
import usePuzzleLike from '@/hooks/usePuzzleLike';
import Main from '@/layouts/Main';
import {
  toggleLikePuzzleConnection,
  toggleLikePuzzlePages,
} from '@/lib/puzzleConnection';
import { generateQueryKey, queryKeys } from '@/lib/queryKeys';
import { PuzzleConnection } from '@/types/puzzle';

export type SearchContainerProps = {
  result: PuzzleConnection;
  search: string;
};

const SearchContainer = (props: SearchContainerProps) => {
  const { result, search } = props;

  const { data: me } = useMe();
  const { mutate } = usePuzzleLike();
  const queryClient = useQueryClient();

  const isPlural = result.edges.length === 0 || result.edges.length > 1;

  return (
    <Main
      breadcrumbLinks={[
        { path: `/search`, title: 'Search' },
        { path: `/search?term=${search}`, title: search },
      ]}
    >
      <VStack w="100%" align="start" spacing="6">
        <VStack spacing="1" align="start">
          <Heading size="md">
            Search Result{isPlural && 's'} for &quot;{search}&quot;
          </Heading>
          <Text fontSize="md" fontWeight="medium" color="text.secondary">
            {result.edges.length} result
            {isPlural && 's'}
          </Text>
        </VStack>

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
          {result.edges.map((edge) => {
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
                    const key = generateQueryKey.Search(search);

                    // Cancel any outgoing refetches so they don't overwrite our optimistic update
                    await queryClient.cancelQueries(key);
                    // Snapshot the previous value
                    const previous = queryClient.getQueryData<
                      PuzzleConnection | undefined
                    >(key);

                    queryClient.setQueryData<PuzzleConnection | undefined>(
                      key,
                      (old) => {
                        if (!old) {
                          return old;
                        }

                        const now = dayjs().tz().toDate();
                        const newEdges = old.edges.map((e) => {
                          if (e.node.id === node.id) {
                            return {
                              ...e,
                              node: {
                                ...e.node,
                                likedAt: e.node.likedAt ? null : now,
                                numOfLikes: e.node.likedAt
                                  ? e.node.numOfLikes - 1
                                  : e.node.numOfLikes + 1,
                              },
                            };
                          }
                          return e;
                        });

                        return { ...old, edges: newEdges };
                      }
                    );

                    mutate(node, {
                      onError: async () => {
                        queryClient.setQueryData<PuzzleConnection | undefined>(
                          key,
                          previous
                        );
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
                        const togglePuzzles = toggleLikePuzzlePages(
                          node.id,
                          queryClient,
                          {
                            exact: false,
                            queryKey: queryKeys.PuzzlesList,
                          }
                        );

                        await Promise.all([
                          toggleMostPlayed,
                          togglePuzzleCreated,
                          togglePuzzles,
                        ]);
                      },
                    });
                  }}
                />
              </GridItem>
            );
          })}
        </Grid>
      </VStack>
    </Main>
  );
};

export default SearchContainer;
