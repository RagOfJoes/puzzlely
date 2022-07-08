import { Input, useMergeRefs, Wrap, WrapItem } from '@chakra-ui/react';
import { forwardRef, useMultiStyleConfig } from '@chakra-ui/system';
import { runIfFn } from '@chakra-ui/utils';

import { useTagInputContext } from './Context';
import { TagInputFieldProps } from './types';

const TagInputField = forwardRef<TagInputFieldProps, 'input'>(
  (props, forwardedRef) => {
    const { children: childrenProp, ...wrapperProps } = props;

    const { getInputProps, inputRef, inputWrapperRef, tags } =
      useTagInputContext();
    const inputProps = getInputProps(wrapperProps);

    const ref = useMergeRefs(forwardedRef, inputRef);

    const children = runIfFn(childrenProp, { tags });

    const inputTheme: any = useMultiStyleConfig('Input', props);

    return (
      <Wrap
        ref={inputWrapperRef}
        onClick={() => inputRef.current?.focus}
        {...inputTheme.field}
        minH={9}
        py={1.5}
        spacing={3}
        cursor="text"
        h="fit-content"
        position="relative"
        // eslint-disable-next-line no-underscore-dangle
        _focusWithin={inputTheme.field._focusVisible}
        aria-invalid={
          inputRef.current?.attributes.getNamedItem('aria-invalid')
            ? 'true'
            : ''
        }
        {...wrapperProps}
      >
        {children}
        <WrapItem as={Input} {...(inputProps as any)} ref={ref} />
      </Wrap>
    );
  }
);

export default TagInputField;
