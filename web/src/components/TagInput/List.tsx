import React from 'react';

import {
  forwardRef,
  PopoverContent,
  PopoverContentProps,
  useDimensions,
  useMergeRefs,
} from '@chakra-ui/react';

import { useTagInputContext } from './Context';
import { siblingInfo } from './utils';

export type AutoCompleteListProps = PopoverContentProps;

const TagInputList = forwardRef<PopoverContentProps, 'div'>(
  (props, forwardedRef) => {
    const { children, ...rest } = props;

    const { inputWrapperRef, listRef } = useTagInputContext();

    const ref = useMergeRefs(forwardedRef, listRef);

    const dimension = useDimensions(inputWrapperRef, true);
    const [autoCompleteItems, nonAutoCompleteItems] = siblingInfo(children);

    return (
      <PopoverContent
        mt="4"
        py="4"
        ref={ref}
        opacity={0}
        bg="surface"
        rounded="md"
        maxH="350px"
        border="none"
        shadow="base"
        zIndex="popover"
        overflowY="auto"
        position="absolute"
        width={dimension?.marginBox.width}
        _focusVisible={{
          boxShadow: 'none',
        }}
        {...rest}
      >
        {autoCompleteItems}
        {nonAutoCompleteItems}
      </PopoverContent>
    );
  }
);

export default TagInputList;
