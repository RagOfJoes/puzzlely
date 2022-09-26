import { createContext } from '@chakra-ui/react-utils';

import { UseTagInput } from './types';

export const [TagInputProvider, useTagInputContext] =
  createContext<UseTagInput>({
    name: 'TagInputContext',
    errorMessage:
      'useTagInputContext: `context` is undefined. Seems you forgot to wrap all taginput components within `<TagInput />`',
  });
