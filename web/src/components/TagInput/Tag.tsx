import { memo } from 'react';

import {
  Tag,
  TagCloseButton,
  TagLabel,
  TagProps,
  WrapItem,
} from '@chakra-ui/react';
import { runIfFn } from '@chakra-ui/utils';

import { TagInputTagProps } from './types';

const disabledStyles: TagProps = {
  opacity: 0.4,
  cursor: 'text',
  userSelect: 'none',
  _focusVisible: { boxShadow: 'none' },
};

const TagInputTag = (props: TagInputTagProps) => {
  const { label, onRemove, disabled, ...rest } = props;

  return (
    <WrapItem>
      <Tag
        borderRadius="md"
        fontWeight="normal"
        {...(disabled && disabledStyles)}
        {...rest}
      >
        <TagLabel>{label}</TagLabel>
        <TagCloseButton
          cursor="pointer"
          isDisabled={disabled}
          onClick={() => {
            if (disabled) {
              return;
            }

            runIfFn(onRemove);
          }}
          {...(disabled && disabledStyles)}
        />
      </Tag>
    </WrapItem>
  );
};

export default memo(TagInputTag);
