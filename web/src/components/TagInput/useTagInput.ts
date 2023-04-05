import { useMemo, useRef, useState } from "react";

import { useControllableState } from "@chakra-ui/react";
import { runIfFn } from "@chakra-ui/utils";

import type { TagInputProps, UseTagInput, TagInputItemProps } from "./types";

const useTagInput = (props: TagInputProps): UseTagInput => {
  const {
    children,
    defaultQuery,
    defaultValue,
    value: valueProp,
    onChange,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapperRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState(defaultQuery ?? "");
  const [value, setValue] = useControllableState<string[]>({
    value: valueProp,
    defaultValue,
    onChange: (newValues: string[]) => {
      runIfFn(onChange, newValues);
    },
  });

  const removeItem: UseTagInput["removeItem"] = (valueToRemove) => {
    if (!valueToRemove) {
      return;
    }

    const found = value.findIndex((v) => v === valueToRemove);
    if (found === -1) {
      return;
    }

    runIfFn(props.onTagRemove, valueToRemove);
    setValue(value.filter((_, idx) => idx !== found));
    if (query === valueToRemove) {
      setQuery("");
    }

    inputRef.current?.focus();
  };

  const tagProps: TagInputItemProps[] = useMemo(() => {
    return value.map((v) => ({
      children: v,
      onRemove: () => removeItem(v),
    }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return {
    children,
    inputRef,
    inputWrapperRef,
    query,
    removeItem,
    setQuery,
    setValue,
    tagProps,
    value,
  };
};

export default useTagInput;
