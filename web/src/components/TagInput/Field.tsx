import { MouseEventHandler, RefObject, useMemo } from 'react';

import {
  Input,
  InputProps,
  useMergeRefs,
  Wrap,
  WrapItem,
  WrapProps,
} from '@chakra-ui/react';
import { forwardRef, useMultiStyleConfig } from '@chakra-ui/system';
import { omit, runIfFn } from '@chakra-ui/utils';

import { useTagInputContext } from './Context';
import { TagInputFieldProps } from './types';

const TagInputField = forwardRef<TagInputFieldProps, 'input'>(
  (props, forwardedRef) => {
    const { children: childrenProp, ...otherWrapperProps } = props;
    const { onBlur, onChange, onFocus, onKeyDown, ...otherInputProps } =
      otherWrapperProps;

    const {
      inputRef,
      inputWrapperRef,
      query,
      setQuery,
      setValue,
      tagProps,
      value,
    } = useTagInputContext();

    const ref = useMergeRefs(forwardedRef, inputRef);

    const children = runIfFn(childrenProp, { tagProps });

    const inputTheme: any = useMultiStyleConfig('Input', props);

    const wrapperProps: WrapProps & {
      onClick: MouseEventHandler<HTMLDivElement>;
      ref: RefObject<HTMLDivElement>;
    } = useMemo(() => {
      return {
        ref: inputWrapperRef,
        onClick: () => {
          inputRef?.current?.focus();
        },
        ...inputTheme.field,
        pos: 'relative',
        minH: 9,
        // px: 3,
        py: 1.5,
        spacing: 3,
        cursor: 'text',
        h: 'fit-content',
        // eslint-disable-next-line no-underscore-dangle
        _focusWithin: inputTheme.field._focusVisible,
        ...omit(otherInputProps, ['variant']),
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, value]);

    const inputProps: Omit<InputProps, 'children'> = useMemo(() => {
      return {
        value: query,
        variant: 'unstyled',
        onBlur: (e) => {
          runIfFn(onBlur, e);
          const inputWrapperIsFocused = inputWrapperRef.current?.contains(
            e.relatedTarget as any
          );

          if (!inputWrapperIsFocused) {
            if (!value.includes(e.target.value)) {
              setQuery('');
            }
          }
        },
        onChange: (e) => {
          runIfFn(onChange, e);

          setQuery(e.target.value);
        },
        onFocus: (e) => {
          runIfFn(onFocus, e);

          e.target.select();
        },
        onKeyDown: (e) => {
          runIfFn(onKeyDown, e);

          const { key } = e;
          if (key === 'Enter' && query.length > 0) {
            if (!value.includes(query)) {
              setValue((prev) => [...prev, query]);
            }
            setQuery('');
            inputRef.current?.focus();

            e.preventDefault();
          }
        },
        ...omit(otherInputProps, ['variant']),
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, value]);

    return (
      <Wrap {...wrapperProps}>
        {children}

        <WrapItem as={Input} {...(inputProps as any)} ref={ref} />
      </Wrap>
    );
  }
);

export default TagInputField;
