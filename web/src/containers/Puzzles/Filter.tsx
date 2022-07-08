import { Dispatch, SetStateAction } from 'react';

import {
  Box,
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoChevronDown } from 'react-icons/io5';

import { PUZZLE_OVERVIEW_FILTERS } from '@/lib/constants';
import { PuzzleFilters } from '@/types/puzzle';

type FilterProps = {
  filters: { [key in PuzzleFilters]?: string };
  setFilters: Dispatch<SetStateAction<{ [key in PuzzleFilters]?: string }>>;
};

const Filter = (props: FilterProps) => {
  const { filters, setFilters } = props;

  const hoverBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.200');
  return (
    <Box
      w="100%"
      display="flex"
      justifyContent={{ base: 'space-between', sm: 'flex-start' }}
    >
      <Menu>
        <MenuButton
          as={Button}
          bgColor="surface"
          colorScheme="gray"
          fontWeight="medium"
          color="text.secondary"
          textTransform="capitalize"
          rightIcon={<Icon as={IoChevronDown} />}
          _focus={{
            boxShadow: 'outline',
          }}
          _hover={{
            bg: hoverBg,
            color: 'inherit',
          }}
          _active={{
            bg: hoverBg,
            color: 'inherit',
            boxShadow: 'outline',
          }}
        >
          Filter
        </MenuButton>
        <MenuList>
          {Object.keys(PUZZLE_OVERVIEW_FILTERS).map((key) => {
            const typedKey = key as keyof typeof PUZZLE_OVERVIEW_FILTERS;

            const value = PUZZLE_OVERVIEW_FILTERS[typedKey];

            if (!value) {
              return null;
            }

            return (
              <MenuOptionGroup
                type="radio"
                title={value.label}
                key={`Puzzle__Category__${key}`}
                value={filters[typedKey] || ''}
                onChange={() => {}}
              >
                {value.options.map((option) => {
                  return (
                    <MenuItemOption
                      textTransform="capitalize"
                      isChecked={!!filters[typedKey]}
                      key={`Puzzle__Category__${key}__${option.value}`}
                      iconSpacing={
                        filters[typedKey] === String(option.value) ? '3' : 0
                      }
                      value={
                        typeof option.value !== 'string'
                          ? String(option.value)
                          : option.value
                      }
                      onClick={(e) => {
                        const v = e.currentTarget.value;
                        if (filters[typedKey] === v) {
                          setFilters((prev) => {
                            const newFilters = { ...prev };
                            delete newFilters[typedKey];
                            return newFilters;
                          });
                          return;
                        }
                        setFilters((prev) => ({ ...prev, [typedKey]: v }));
                      }}
                    >
                      {option.label}
                    </MenuItemOption>
                  );
                })}
              </MenuOptionGroup>
            );
          })}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default Filter;
