import { Box, BoxProps, Divider, Heading, Text } from '@chakra-ui/react';
import { forwardRef } from '@chakra-ui/system';

export type PuzzleFormCardProps = Omit<BoxProps, 'title'> & {
  caption?: string;
  hideDivider?: boolean;
  title?: string;
};

const PuzzleFormCard = forwardRef<PuzzleFormCardProps, 'div'>((props, ref) => {
  const { caption, children, hideDivider = false, title, ...other } = props;

  return (
    <Box {...other} p="4" ref={ref} bg="surface" borderRadius="lg">
      {title && (
        <Heading as="h4" size="md">
          {title}
        </Heading>
      )}
      {caption && (
        <Text fontSize="md" color="text.secondary">
          {caption}
        </Text>
      )}
      {!hideDivider && <Divider mt="2" mb="4" />}

      {children}
    </Box>
  );
});

export default PuzzleFormCard;
