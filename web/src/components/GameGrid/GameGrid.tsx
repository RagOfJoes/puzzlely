import { forwardRef, Grid } from '@chakra-ui/react';

import { GameGridProps } from './types';

const GameGrid = forwardRef<GameGridProps, 'div'>((props, ref) => {
  const { children } = props;

  return (
    <Grid
      gap="2"
      w="100%"
      ref={ref}
      borderRadius="lg"
      position="relative"
      templateRows="repeat(4, 1fr)"
      templateColumns="repeat(4, minmax(0, 1fr))"
      css={{
        '&:before': {
          width: 0,
          content: '""',
          gridRow: '1 / 1',
          gridColumn: '1 / 1',
          paddingBottom: '100%',
        },
        '& > *:first-of-type': {
          gridRow: '1 / 1',
          gridColumn: '1 / 1',
        },
      }}
    >
      {children}
    </Grid>
  );
});

export default GameGrid;
