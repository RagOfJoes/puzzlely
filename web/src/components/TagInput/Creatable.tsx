import { Flex } from '@chakra-ui/react';
import { runIfFn } from '@chakra-ui/utils';

import { useTagInputContext } from './Context';
import { TagInputCreatableProps } from './types';

const TagInputCreatable = (props: TagInputCreatableProps) => {
  const { children: childrenProp, ...rest } = props;
  const { getCreatableProps, query } = useTagInputContext();

  const { children, ...creatableProps } = getCreatableProps({
    ...props,
    value: query,
    children: runIfFn(childrenProp, {
      value: query,
    }),
  });

  return (
    <Flex
      mx="2"
      px="2"
      py="2"
      rounded="md"
      cursor="pointer"
      {...creatableProps}
      {...rest}
    >
      {children || `Add ${query}`}
    </Flex>
  );
};

export default TagInputCreatable;
