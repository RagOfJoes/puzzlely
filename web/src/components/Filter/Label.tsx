import { forwardRef, Text } from '@chakra-ui/react';

import { FilterLabelProps } from './types';

const FilterLabel = forwardRef<FilterLabelProps, 'p'>((props, ref) => {
  return (
    <Text
      fontSize="md"
      whiteSpace="nowrap"
      fontWeight="semibold"
      {...props}
      ref={ref}
    />
  );
});

export default FilterLabel;
