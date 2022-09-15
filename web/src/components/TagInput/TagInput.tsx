import { useImperativeHandle } from 'react';

import { forwardRef } from '@chakra-ui/react';

import { TagInputProvider } from './Context';
import { TagInputProps } from './types';
import useTagInput from './useTagInput';

const TagInput = forwardRef<TagInputProps, 'div'>((props, ref) => {
  const value = useTagInput(props);
  const { children, removeItem } = value;

  useImperativeHandle(ref, () => ({
    removeItem,
  }));

  return <TagInputProvider value={value}>{children}</TagInputProvider>;
});

export default TagInput;
