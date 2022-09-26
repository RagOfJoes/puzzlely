import { Dispatch, SetStateAction, useMemo } from 'react';

import { Box, Button, Wrap, WrapItem } from '@chakra-ui/react';
import { QueryKey } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

import FilterComponent, {
  FilterLabel,
  FilterMenu,
  FilterOption,
} from '@/components/Filter';
import { PUZZLE_OVERVIEW_FILTERS } from '@/lib/constants';
import { generateQueryKey } from '@/lib/queryKeys';
import { PuzzleFilters } from '@/types/puzzle';

type FilterProps = {
  filters: { [key in PuzzleFilters]?: string };
  setFilters: Dispatch<SetStateAction<{ [key in PuzzleFilters]?: string }>>;
  setQueryKey: Dispatch<SetStateAction<QueryKey>>;
  queryKey: QueryKey;
};

const Filter = (props: FilterProps) => {
  const { filters, setFilters, setQueryKey, queryKey } = props;

  const hasFilters = useMemo(() => Object.keys(filters).length > 0, [filters]);
  const isQueryKeyDiff = useMemo(
    () =>
      Object.keys(
        (
          queryKey[1] as {
            filters: {
              [key in PuzzleFilters]?: string;
            };
          }
        ).filters
      ).length > 0,
    [queryKey]
  );

  return (
    <Box w="100%">
      <Wrap spacing="4" overflow="unset" w={{ base: '100%', lg: 'auto' }}>
        {Object.keys(PUZZLE_OVERVIEW_FILTERS).map((key) => {
          const typedKey = key as keyof typeof PUZZLE_OVERVIEW_FILTERS;

          const filter = PUZZLE_OVERVIEW_FILTERS[typedKey];

          return (
            <WrapItem key={key} w={{ base: '100%', lg: 'auto' }}>
              <FilterComponent
                value={filters[typedKey] || ''}
                w={{ base: '100%', lg: 'auto' }}
                onChange={(newValue) => {
                  if (newValue === filters[typedKey]) {
                    setFilters((prev) => {
                      const newFilters = { ...prev };
                      delete newFilters[typedKey];

                      return newFilters;
                    });
                    return;
                  }

                  setFilters((prev) => ({ ...prev, [typedKey]: newValue }));
                }}
              >
                <FilterLabel>{filter.label}</FilterLabel>

                <FilterMenu
                  buttonProps={{
                    w: '100%',
                    textAlign: 'start',
                  }}
                  formatValue={(newValue) => {
                    switch (typedKey) {
                      case 'num_of_likes':
                        return `${newValue}+`;
                      default:
                        return newValue[0]!.toUpperCase() + newValue.slice(1);
                    }
                  }}
                >
                  {filter.options.map((option) => {
                    return (
                      <FilterOption
                        value={String(option.value)}
                        key={`${key}-${option.label}`}
                        isChecked={String(option.value) === filters[typedKey]}
                      >
                        {option.label}
                      </FilterOption>
                    );
                  })}
                </FilterMenu>
              </FilterComponent>
            </WrapItem>
          );
        })}
      </Wrap>

      <AnimatePresence>
        {(hasFilters || isQueryKeyDiff) && (
          <Box
            mt="4"
            w="100%"
            exit="exit"
            display="flex"
            as={motion.div}
            initial="initial"
            animate="animate"
            justifyContent={{ base: 'end', lg: 'start' }}
            flexDirection={{ base: 'row-reverse', lg: 'row' }}
            variants={{
              initial: { y: 10, opacity: 0 },
              exit: { y: 10, opacity: 0, transition: { duration: 0.18 } },
              animate: { y: 0, opacity: 1, transition: { duration: 0.18 } },
            }}
          >
            <Button
              ml={{ base: '4', lg: '0' }}
              isDisabled={!hasFilters && isQueryKeyDiff}
              onClick={() => {
                setQueryKey(generateQueryKey.PuzzlesList(filters));
              }}
            >
              Apply
            </Button>

            <Button
              variant="link"
              colorScheme="gray"
              ml={{ base: '0', lg: '4' }}
              onClick={() => {
                setFilters({});

                setQueryKey(generateQueryKey.PuzzlesList({}));
              }}
            >
              Reset
            </Button>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Filter;
