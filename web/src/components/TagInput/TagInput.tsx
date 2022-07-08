import { useImperativeHandle } from 'react';

import { chakra, forwardRef, Popover } from '@chakra-ui/react';

import { TagInputProvider } from './Context';
import { TagInputProps } from './types';
import useTagInput from './useTagInput';

const TagInput = forwardRef<TagInputProps, 'div'>((props, ref) => {
  const value = useTagInput(props);
  const { children, isOpen, onClose, onOpen, resetItems, removeItem } = value;

  useImperativeHandle(ref, () => ({
    resetItems,
    removeItem,
  }));

  return (
    <TagInputProvider value={value}>
      <Popover
        isLazy
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
        autoFocus={false}
        placement="bottom"
        closeOnBlur={true}
      >
        <chakra.div
          sx={{
            '.chakra-popover__popper': {
              position: 'unset !important',
            },
          }}
          w="full"
          ref={ref}
        >
          {children}
        </chakra.div>
      </Popover>
    </TagInputProvider>
  );
});

export default TagInput;
