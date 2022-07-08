import { Box, Grid, GridItem, Heading, Skeleton } from '@chakra-ui/react';

import PuzzleItem from '@/components/PuzzleItem';
import usePuzzlesMostLiked from '@/hooks/usePuzzlesMostLiked';

const NUM_OF_ITEMS = 6;

const MostLiked = () => {
  const { data, isFetched, isLoading } = usePuzzlesMostLiked();

  return (
    <Box
      p="6"
      mt="10"
      as="section"
      bg="surface"
      boxShadow="sm"
      borderRadius="md"
    >
      <Heading size="md">Most Liked Puzzles</Heading>

      <Grid
        mt="5"
        gap={{ base: '6', md: '8' }}
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
              </GridItem>
            );
          })}

        {isLoading &&
          Array.from({ length: NUM_OF_ITEMS }).map((_, index) => (
            <Skeleton key={`PuzzlesMostLiked__Loading__${index}`}>
              <GridItem colSpan={1} rowSpan={1}>
                <PuzzleItem
                  id=""
                  name="Lorem"
                  maxAttempts={0}
                  timeAllowed={0}
                  difficulty="Easy"
                  createdBy="Lorem"
                />
              </GridItem>
            </Skeleton>
          ))}
      </Grid>
    </Box>
  );
};

export default MostLiked;
