import { createContext } from '@chakra-ui/react-utils';

import { UseGameGrid } from './types';

export const [GameGridProvider, useGameGridContext] =
  createContext<UseGameGrid>({
    name: 'GameGridContext',
    errorMessage:
      'useGameGridContext: `context` is undefined. Seems you forgot to wrap all taginput components within `<GameGrid />`',
  });
