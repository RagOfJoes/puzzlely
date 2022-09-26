import { useMemo } from 'react';

import {
  Button,
  forwardRef,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoChevronDown } from 'react-icons/io5';

import { useFilterContext } from './Context';
import { FilterMenuProps } from './types';

const FilterMenu = forwardRef<FilterMenuProps, 'button'>((props, ref) => {
  const {
    buttonProps,
    children,
    formatValue,
    placeholder = 'Select a filter',
  } = props;

  const { value } = useFilterContext();

  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.200');

  const hasValue = useMemo(() => value.length > 0, [value]);
  const formattedValue = useMemo(() => {
    if (!hasValue) {
      return placeholder;
    }

    if (formatValue) {
      return formatValue(value);
    }

    return value;
  }, [formatValue, hasValue, placeholder, value]);

  return (
    <Menu matchWidth {...props}>
      <MenuButton
        mt="2"
        ref={ref}
        as={Button}
        bgColor="surface"
        colorScheme="gray"
        fontWeight="medium"
        rightIcon={<Icon as={IoChevronDown} />}
        color={hasValue ? 'text.primary' : 'text.secondary'}
        _active={{
          bg: hoverBg,
          color: 'inherit',
          boxShadow: 'outline',
        }}
        _focus={{
          boxShadow: 'outline',
        }}
        _hover={{
          bg: hoverBg,
          color: 'inherit',
        }}
        {...buttonProps}
      >
        {formattedValue}
      </MenuButton>

      <MenuList>
        <MenuOptionGroup type="radio" value={value} onChange={() => {}}>
          {children}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
});

export default FilterMenu;
