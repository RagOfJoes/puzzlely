import { forwardRef, MenuItemOption } from '@chakra-ui/react';

import { useFilterContext } from './Context';
import { FilterOptionProps } from './types';

const FilterOption = forwardRef<FilterOptionProps, 'button'>((props, ref) => {
  const { children, isChecked, value } = props;

  const { onChange } = useFilterContext();

  return (
    <MenuItemOption
      {...props}
      ref={ref}
      type="radio"
      value={value}
      iconSpacing={isChecked ? '3' : '0'}
      onClick={() => onChange(value)}
    >
      {children}
    </MenuItemOption>
  );
});

export default FilterOption;
