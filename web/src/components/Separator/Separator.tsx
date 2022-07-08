import { Flex, FlexProps } from '@chakra-ui/react';

const Separator = (props: FlexProps) => {
  const { children, ...rest } = props;
  return (
    <Flex
      h="1px"
      w="100%"
      bgGradient="linear(to-r, background 0%, text.secondary 49.52%, background 100%)"
      {...rest}
    >
      {children}
    </Flex>
  );
};

export default Separator;
