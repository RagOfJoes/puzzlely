import { createContext } from '@chakra-ui/react-utils';

import { UseTagInputReturn } from './types';

export const [TagInputProvider, useTagInputContext] =
  createContext<UseTagInputReturn>({
    name: 'TagInputContext',
    errorMessage:
      'useTagInputContext: `context` is undefined. Seems you forgot to wrap all taginput components within `<TagInput />`',
  });
