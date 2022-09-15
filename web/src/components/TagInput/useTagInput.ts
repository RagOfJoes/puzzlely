import { useCallback, useMemo, useRef, useState } from 'react';

import { useControllableState } from '@chakra-ui/react';
import { runIfFn } from '@chakra-ui/utils';

import { TagProp, TagInputProps, UseTagInputReturn } from './types';

const useTagInput = (props: TagInputProps): UseTagInputReturn => {
  const {
    children,
    defaultQuery,
    defaultValue,
    value: valueProp,
    onChange,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(defaultQuery ?? '');
  const [value, setValue] = useControllableState<string[]>({
    value: valueProp,
    defaultValue,
    onChange: (newValues: string[]) => {
      runIfFn(onChange, newValues);
    },
  });

  const removeItem: UseTagInputReturn['removeItem'] = useCallback(
    (valueToRemove) => {
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
        setQuery('');
      }

      inputRef.current?.focus();
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onTagRemove, query, value]
  );

  const tagProps: TagProp[] = useMemo(() => {
    return value.map((v) => ({
      label: v,
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
