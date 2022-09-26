import { createContext } from '@chakra-ui/react-utils';

import { UseFilter } from './types';

export const [FilterProvider, useFilterContext] = createContext<UseFilter>({
  name: 'FilterContext',
  errorMessage:
    'useFilterContext: `context` is undefined. Seems you forgot to wrap all taginput components within `<Filter />`',
});
