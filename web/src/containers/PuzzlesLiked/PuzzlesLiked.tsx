import { useMemo } from 'react';

import { Grid, Heading, HStack, Text, VStack } from '@chakra-ui/react';

import Waypoint from '@/components/Waypoint';
import useMe from '@/hooks/useMe';
import usePuzzlesLiked from '@/hooks/usePuzzlesLiked';
import useUserStats from '@/hooks/useUserStats';
import { PuzzleConnection, PuzzleEdge } from '@/types/puzzle';

import Cards from './Cards';
import Loading from './Loading';

const PuzzlesLikedContainer = () => {
  const { data: me } = useMe();
  const { data: stats } = useUserStats(me!.id);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = usePuzzlesLiked();

  const connection: PuzzleConnection = useMemo(() => {
    if (!data || data.pages.length === 0) {
      return {
        edges: [],
        pageInfo: {
          cursor: '',
          hasNextPage: false,
        },
      };
    }

    const pageInfo: PuzzleConnection['pageInfo'] = data.pages[
      data.pages.length - 1
    ]?.pageInfo || { cursor: '', hasNextPage: false };
    const edges: PuzzleEdge[] = [];
    data.pages.forEach((page) => {
      if (page.edges.length > 0) {
        edges.push(...page.edges);
      }
    });
    return {
      edges,
      pageInfo,
    };
  }, [data]);

  return (
    <VStack w="100%" align="start" spacing="6">
      <VStack spacing="1" align="start">
        <HStack align="end" spacing="1">
          <Heading size="md">Liked Puzzles</Heading>
          <Text fontSize="sm" fontWeight="medium" color="text.secondary">
            ({stats?.puzzlesLiked || 0})
          </Text>
        </HStack>
        <Text fontSize="md" fontWeight="medium" color="text.secondary">
          Sorted by recently liked.
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
      </Grid>
    </VStack>
  );
};

export default PuzzlesLikedContainer;
