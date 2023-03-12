import type { Dispatch, SetStateAction } from "react";
import { useCallback, useMemo } from "react";

import * as Popover from "@radix-ui/react-popover";
import type { QueryKey } from "@tanstack/react-query";
import clsx from "clsx";
import { IoClose, IoFilter } from "react-icons/io5";

import { FormControl, FormControlLabel } from "@/components/FormControl";
import {
  Select,
  SelectList,
  SelectListItem,
  SelectTrigger,
} from "@/components/Select";
import { PUZZLE_OVERVIEW_FILTERS } from "@/lib/constants";
import { generateQueryKey } from "@/lib/queryKeys";
import type { PuzzleFilters } from "@/types/puzzle";

type FilterProps = {
  filters: { [key in PuzzleFilters]?: string };
  setFilters: Dispatch<SetStateAction<{ [key in PuzzleFilters]?: string }>>;
  setQueryKey: Dispatch<SetStateAction<QueryKey>>;
  queryKey: QueryKey;
};

function Filter(props: FilterProps) {
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

  const onFilterSelect = useCallback(
    (key: PuzzleFilters, value: string) => {
      let newFilters: { [key in PuzzleFilters]?: string } = {};

      // If filter is already selected then clear it
      if (value === filters[key]) {
        newFilters = { ...filters };
        delete newFilters[key];
      } else {
        newFilters = { ...filters, [key]: value };
      }

      setFilters(newFilters);
      setQueryKey(generateQueryKey.PuzzlesList(newFilters));
    },
    [filters, setFilters, setQueryKey]
  );

  return (
    <div className="flex w-full justify-between gap-2">
      <div className="flex flex-col items-start gap-1">
        <h2 className="font-heading text-xl font-bold">Recent Puzzles</h2>

        <p className="font-medium text-subtle">
          To narrow down results use the filter button on the right.
        </p>

        {(hasFilters || isQueryKeyDiff) && (
          <div className="flex flex-wrap gap-1">
            {Object.keys(filters).map((key) => {
              const typedKey = key as PuzzleFilters;
              const filter = PUZZLE_OVERVIEW_FILTERS[typedKey];

              return (
                <span
                  key={key}
                  className={clsx(
                    "flex h-6 items-center gap-1.5 rounded-md bg-muted/10 px-2 text-subtle outline-none",

                    "dark:bg-muted/20"
                  )}
                >
                  <p className="text-ellipsis text-sm font-medium capitalize leading-none line-clamp-1">
                    {filter.label}: {filters[typedKey]}
                  </p>

                  <button
                    aria-label="Remove filter"
                    className={clsx(
                      "rounded-full text-subtle outline-none transition",

                      "focus-visible:ring",
                      "hover:text-text"
                    )}
                    onClick={() => {
                      const value = filters[typedKey];
                      if (!value) {
                        return;
                      }

                      onFilterSelect(typedKey, value);
                    }}
                  >
                    <IoClose size={14} />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button
              aria-label="Open Filters"
              className={clsx(
                "relative flex h-10 shrink-0 select-none appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md bg-surface px-4 font-medium text-subtle outline-none transition",

                "active:bg-muted/20",
                "focus-visible:ring",
                "hover:bg-muted/10"
              )}
            >
              Filters
              <IoFilter />
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="z-10 w-80 rounded-lg border border-muted/20 bg-surface shadow"
            >
              <header className="border-b border-b-muted/20 px-3 py-4 font-semibold">
                Filters
              </header>

              <div className="flex flex-col gap-4 px-4 py-6">
                {Object.keys(PUZZLE_OVERVIEW_FILTERS).map((key) => {
                  const typedKey = key as PuzzleFilters;
                  const filter = PUZZLE_OVERVIEW_FILTERS[typedKey];

                  return (
                    <div
                      key={key}
                      className={clsx(
                        "w-auto",

                        "max-lg:w-full"
                      )}
                    >
                      <FormControl>
                        <FormControlLabel className="text-sm">
                          {filter.label}
                        </FormControlLabel>

                        <Select
                          value={filters[typedKey]}
                          onValueChange={(newValue) => {
                            onFilterSelect(typedKey, newValue);
                          }}
                        >
                          <SelectTrigger className="w-full justify-between border border-muted/20" />

                          <SelectList className="border">
                            {filter.options.map((option) => (
                              <SelectListItem
                                key={`${key}-${option.label}`}
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectListItem>
                            ))}
                          </SelectList>
                        </Select>
                      </FormControl>
                    </div>
                  );
                })}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}

export default Filter;
