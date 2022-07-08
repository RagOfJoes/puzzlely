import {
  Box,
  Divider,
  Heading,
  HStack,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';

import FormikTextareaControl from '@/components/FormikTextareaControl';
import { Group as PuzzleGroup } from '@/types/puzzle';

const Group = (props: { group: PuzzleGroup; index: number }) => {
  const { group, index } = props;

  return (
    <VStack w="100%" align="start">
      <Heading size="sm">Group {index + 1}</Heading>

      <Divider />

      <Box w="100%" overflow="hidden">
        <Text mb="2" fontSize="md" fontWeight="medium">
          Blocks
        </Text>
        <HStack>
          {group.blocks.map((block) => (
            <Tag
              key={`PuzzleUpdateForm__Group__${index}__Block__${block.value}`}
            >
              <Text
                fontSize="sm"
                noOfLines={1}
                fontWeight="medium"
                whiteSpace="nowrap"
                display="inline-block"
              >
                {block.value}
              </Text>
            </Tag>
          ))}
        </HStack>
      </Box>
      <Box w="100%" overflow="hidden">
        <Text mb="2" fontSize="md" fontWeight="medium">
          Answers
        </Text>
        <HStack>
          {group.answers.map((answer) => (
            <Tag key={`PuzzleUpdateForm__Group__${index}__Answer__${answer}`}>
              <Text
                fontSize="sm"
                noOfLines={1}
                fontWeight="md"
                whiteSpace="nowrap"
                display="inline-block"
              >
                {answer}
              </Text>
            </Tag>
          ))}
        </HStack>
      </Box>
      <FormikTextareaControl
        isRequired
        label="Description"
        name={`groups[${index}].description`}
        helperText="Description of how, what, or, why the blocks link the group together."
        textareaProps={{
          size: 'md',
          resize: 'none',
          placeholder: 'Add a description...',
        }}
      />
    </VStack>
  );
};

export default Group;
