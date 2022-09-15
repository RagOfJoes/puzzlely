import {
  Box,
  Divider,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Text,
} from '@chakra-ui/react';

import FormikTextareaControl from '@/components/FormikTextareaControl';
import TagInput, { TagInputField, TagInputTag } from '@/components/TagInput';

import { PuzzleCreateFormGroupProps } from '../types';

const Group = (props: PuzzleCreateFormGroupProps) => {
  const {
    errors,
    group,
    index,
    isDisabled,
    setFieldTouched,
    setFieldValue,
    touched,
  } = props;

  const blocksName = `groups.[${index}].blocks`;
  const answersName = `groups.[${index}].answers`;

  return (
    <Box w="100%">
      <Heading size="sm">Group {index + 1}</Heading>
      <Divider mt="2" mb="4" />

      <FormControl
        isRequired
        isDisabled={isDisabled}
        isInvalid={!!errors?.blocks && !!touched?.blocks}
      >
        <FormLabel>Blocks</FormLabel>
        <TagInput
          value={group.blocks.map((v) => v.value)}
          onBlur={() => setFieldTouched('')}
          onChange={(newValue) => {
            if (newValue.length > 4) {
              return;
            }

            setFieldValue(
              blocksName,
              newValue.map((v) => ({ value: v }))
            );
          }}
        >
          <TagInputField
            required={false}
            disabled={isDisabled}
            placeholder="Type a block, then, hit ENTER ..."
            aria-invalid={!!(errors?.blocks && !!touched?.blocks)}
            onBlur={() => {
              setFieldTouched(blocksName, true);
            }}
          >
            {({ tagProps }) =>
              tagProps.map((tagProp, idx) => (
                <TagInputTag
                  key={idx}
                  label={tagProp.label}
                  disabled={isDisabled}
                  onRemove={() => tagProp.onRemove()}
                />
              ))
            }
          </TagInputField>
        </TagInput>
        {errors?.blocks && !!touched?.blocks ? (
          <FormErrorMessage>{errors.blocks}</FormErrorMessage>
        ) : (
          <FormHelperText>
            Terms that will link this group together.
          </FormHelperText>
        )}
      </FormControl>

      <FormControl
        mt="4"
        isRequired
        isDisabled={isDisabled}
        isInvalid={!!errors?.answers && touched?.answers}
      >
        <FormLabel>Answers</FormLabel>
        <TagInput
          value={group.answers}
          onBlur={() => setFieldTouched(answersName, true)}
          onChange={(newValue) => {
            if (newValue.length > 8) {
              return;
            }

            setFieldValue(answersName, newValue);
          }}
        >
          <TagInputField
            required={false}
            disabled={isDisabled}
            placeholder="Type an answer, then, hit ENTER..."
            aria-invalid={!!(errors?.answers && !!touched?.answers)}
            onBlur={() => {
              setFieldTouched(answersName, true);
            }}
          >
            {({ tagProps }) =>
              tagProps.map((tagProp, idx) => (
                <TagInputTag
                  key={idx}
                  label={tagProp.label}
                  disabled={isDisabled}
                  onRemove={() => tagProp.onRemove()}
                />
              ))
            }
          </TagInputField>
        </TagInput>
        {errors?.answers && touched?.answers ? (
          <FormErrorMessage>{errors.answers}</FormErrorMessage>
        ) : (
          <FormHelperText>
            Keep words in their shortest form to ensure that you cover as many
            answers as possible. Example{' '}
            <Text as="i" fontWeight="bold">
              brit
            </Text>{' '}
            will match{' '}
            <Text as="i" fontWeight="bold">
              british
            </Text>{' '}
            and{' '}
            <Text as="i" fontWeight="bold">
              britain
            </Text>
            .
          </FormHelperText>
        )}
      </FormControl>

      <FormikTextareaControl
        mt="4"
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
    </Box>
  );
};

export default Group;
