import { Box } from '@chakra-ui/react';
import { forwardRef } from '@chakra-ui/system';

import { FilterProvider } from './Context';
import { FilterProps } from './types';
import useFilter from './useFilter';

const Filter = forwardRef<FilterProps, 'div'>((props, ref) => {
  const { children } = props;

  const value = useFilter(props);

  return (
    <FilterProvider value={value}>
      <Box {...props} ref={ref}>
        {children}
      </Box>
    </FilterProvider>
  );
});

export default Filter;
