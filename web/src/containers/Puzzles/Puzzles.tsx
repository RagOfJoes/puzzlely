import { useMemo, useState } from 'react';

import { Grid, VStack } from '@chakra-ui/react';

import Waypoint from '@/components/Waypoint';
import usePuzzles from '@/hooks/usePuzzles';
import { generateQueryKey } from '@/lib/queryKeys';
import { PuzzleConnection, PuzzleEdge, PuzzleFilters } from '@/types/puzzle';

import Cards from './Cards';
import Filter from './Filter';
import Loading from './Loading';

const PuzzlesContainer = () => {
  const [filters, setFilters] = useState<{
    [key in PuzzleFilters]?: string;
  }>({});

  const queryKey = useMemo(
    () => generateQueryKey.PuzzlesList(filters),
    [filters]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = usePuzzles(queryKey, { filters });

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
      <Filter filters={filters} setFilters={setFilters} />

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

export default PuzzlesContainer;
