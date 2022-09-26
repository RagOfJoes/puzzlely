import { useControllableState } from '@chakra-ui/react';

import { FilterProps, UseFilter } from './types';

const useFilter = (props: FilterProps): UseFilter => {
  const { onChange: onChangeProps, value: valueProps } = props;

  const [value, onChange] = useControllableState({
    onChange: onChangeProps,
    // Allows for a filter to be cleared
    shouldUpdate: () => true,
    value: valueProps,
  });

  return {
    onChange,
    value,
  };
};

export default useFilter;
