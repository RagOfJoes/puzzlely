import { useCallback, useMemo, useRef, useState } from 'react';

import { useControllableState, useDisclosure } from '@chakra-ui/react';
import {
  getFirstItem,
  getLastItem,
  getNextItem,
  getPrevItem,
  isEmpty,
  runIfFn,
} from '@chakra-ui/utils';

import { ItemTag, TagInputProps, UseTagInputReturn } from './types';
import { setEmphasis } from './utils';

const useTagInput = (props: TagInputProps): UseTagInputReturn => {
  const {
    defaultIsOpen,
    defaultQuery,
    defaultValue,
    value: valueProp,
    onChange,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef<'mouse' | 'keyboard' | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { isOpen, onClose, onOpen } = useDisclosure({ defaultIsOpen });

  const [query, setQuery] = useState(defaultQuery ?? '');
  const [focusedValue, setFocusedValue] = useState<string | undefined>();
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

      setValue((prev) => {
        const found = value.findIndex((v) => v === valueToRemove);
        if (found === -1) {
          return prev;
        }
        runIfFn(props.onTagRemove, valueToRemove);
        return prev.filter((_, idx) => idx !== found);
      });
      if (query === valueToRemove) {
        setQuery('');
      }
      inputRef.current?.focus();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.onTagRemove, query, value]
  );
  const resetItems: UseTagInputReturn['resetItems'] = useCallback(
    (focusInput) => {
      setValue([]);
      if (focusInput) {
        inputRef.current?.focus();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const selectItem = useCallback(
    (optionValue: string) => {
      if (!value.includes(optionValue)) {
        setValue((prev) => [...prev, optionValue]);
      }
      inputRef.current?.focus();
      setQuery('');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  const children = runIfFn(props.children, {
    isOpen,
    onClose,
    onOpen,
  });
  const tags: ItemTag[] = useMemo(() => {
    return value.map((v) => ({
      label: v,
      onRemove: () => removeItem(v),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const getInputProps: UseTagInputReturn['getInputProps'] = useCallback(
    (inputProps) => {
      // eslint-disable-next-line @typescript-eslint/no-shadow, unused-imports/no-unused-vars
      const { onBlur, onChange, onFocus, onKeyDown, variant, ...rest } =
        inputProps;
      return {
        onFocus: (e) => {
          runIfFn(onFocus, e);
          onOpen();
          e.target.select();
        },
        onBlur: (e) => {
          runIfFn(onBlur, e);
          const listIsFocused = e.relatedTarget === listRef?.current;
          const inputWrapperIsFocused = inputWrapperRef.current?.contains(
            e.relatedTarget as any
          );
          if (!listIsFocused && !inputWrapperIsFocused) {
            onClose();
            if (!value.includes(e.target.value)) {
              setQuery('');
            }
          }
        },
        onChange: (e) => {
          const newValue = e.target.value;
          runIfFn(inputProps.onChange, e);
          setQuery(newValue);
          if (isEmpty(newValue)) {
            onClose();
            return;
          }
          onOpen();
        },
        onKeyDown: (e) => {
          runIfFn(onKeyDown, e);
          interactionRef.current = 'keyboard';

          const { key } = e;
          if (['Enter'].includes(key) && query.length > 0) {
            selectItem(query);
            inputRef.current?.focus();
            e.preventDefault();
            return;
          }

          const list = [query];
          const nextItem = getNextItem(0, list, true);
          const prevItem = getPrevItem(0, list, true);
          const firstItem = getFirstItem(list);
          const lastItem = getLastItem(list);
          switch (key) {
            case 'ArrowDown':
              setFocusedValue(nextItem);
              e.preventDefault();
              break;
            case 'ArrowUp':
              setFocusedValue(prevItem);
              e.preventDefault();
              break;
            case 'Tab':
              setFocusedValue(nextItem);
              if (isOpen) {
                e.preventDefault();
              }
              break;
            case 'Home':
              setFocusedValue(firstItem);
              e.preventDefault();
              break;
            case 'End':
              setFocusedValue(lastItem);
              e.preventDefault();
              break;
            case 'Escape':
              onClose();
              e.preventDefault();
              break;
            default:
          }
        },
        value: query,
        variant: 'unstyled',
        ...rest,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, query, value]
  );
  const getCreatableProps: UseTagInputReturn['getCreatableProps'] = useCallback(
    (creatableProps) => {
      const {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _fixed,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _focusVisible,
        children: itemChild,
        disabled,
        fixed,
        label,
        onClick,
        onMouseOver,
        sx,
        value: creatableValueProp,
        ...rest
      } = creatableProps;

      const isFocused = creatableValueProp === focusedValue;
      const itemLabel = itemChild || label || creatableValueProp;
      return {
        ...(typeof itemLabel !== 'string'
          ? { children: itemLabel }
          : {
              dangerouslySetInnerHTML: {
                __html: setEmphasis(itemLabel, query),
              },
            }),
        'aria-selected': value.includes(creatableValueProp),
        'aria-disabled': disabled,
        _disabled: {
          opacity: 0.04,
          userSelect: 'none',
          cursor: 'not-allowed',
        },
        sx: {
          ...sx,
          mark: {
            color: 'inherit',
            bg: 'transparent',
          },
        },
        onClick: (e) => {
          runIfFn(onClick, e);
          if (!disabled && creatableValueProp.length > 0) {
            selectItem(creatableValueProp);
            return;
          }
          inputRef.current?.focus();
        },
        onMouseOver: (e) => {
          runIfFn(onMouseOver, e);
          setFocusedValue(creatableValueProp);
          interactionRef.current = 'mouse';
        },
        ...(isFocused &&
          (_focusVisible || {
            bg: 'slate',
            _light: {
              bg: 'gray.100',
            },
          })),
        ...(fixed && _fixed),
        ...rest,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedValue, query, value]
  );

  return {
    children,
    getCreatableProps,
    getInputProps,
    inputRef,
    inputWrapperRef,
    isOpen,
    listRef,
    onClose,
    onOpen,
    query,
    removeItem,
    resetItems,
    setQuery,
    setValue,
    tagInputProps: props,
    tags,
    value,
  };
};

export default useTagInput;
