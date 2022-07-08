import { useMemo } from 'react';

import {
  Divider,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Field, FieldProps, useFormikContext } from 'formik';

import FormikTextareaControl from '@/components/FormikTextareaControl';
import TagInput, {
  TagInputCreatable,
  TagInputField,
  TagInputList,
  TagInputTag,
} from '@/components/TagInput';
import { PuzzleCreatePayload } from '@/types/puzzle';

const Group = (props: { index: number }) => {
  const { index } = props;

  const {
    errors,
    isSubmitting,
    isValidating,
    setFieldTouched,
    setFieldValue,
    touched,
  } = useFormikContext<PuzzleCreatePayload>();

  const isDisabled = isSubmitting || isValidating;
  const groupError = useMemo(() => {
    const err = errors.groups?.[index] as
      | null
      | { answers: string; blocks: string; description: string }
      | undefined;

    return {
      answers: err?.answers,
      blocks: err?.blocks,
      description: err?.description,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors.groups?.[index]]);
  const groupTouched = useMemo(() => {
    return touched.groups?.[index];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched.groups?.[index]]);

  return (
    <VStack w="100%" align="start">
      <Heading size="sm">Group {index + 1}</Heading>

      <Divider />

      <Field name={`groups[${index}].blocks`}>
        {({
          field,
        }: FieldProps<
          { value: string }[],
          { blocks?: { value?: string }[] }
        >) => (
          <FormControl
            isRequired
            isDisabled={isDisabled}
            isInvalid={!!groupError.blocks && !!groupTouched?.blocks}
          >
            <FormLabel>Blocks</FormLabel>
            <TagInput
              {...field}
              isDisabled={isDisabled}
              value={field.value.map((v) => v.value)}
              onChange={(newValue) => {
                if (newValue.length > 4) {
                  return;
                }
                setFieldValue(
                  field.name,
                  newValue.map((v) => ({ value: v }))
                );
              }}
            >
              <TagInputField
                required={false}
                disabled={isDisabled}
                placeholder="Add a block..."
                aria-invalid={!!(groupError.blocks && !!groupTouched?.blocks)}
                onBlur={() => {
                  setFieldTouched(field.name, true);
                }}
              >
                {({ tags }) =>
                  tags.map((tag, idx) => (
                    <TagInputTag
                      key={idx}
                      label={tag.label}
                      onRemove={() => {
                        if (isDisabled) {
                          return;
                        }

                        tag.onRemove();
                      }}
                    />
                  ))
                }
              </TagInputField>
              <TagInputList>
                <TagInputCreatable>
                  {({ value }) => {
                    if (value.length === 0) {
                      return (
                        <Text fontStyle="italic" color="text.secondary">
                          Start typing, then, hit &quot;Enter&quot; to add a
                          block....
                        </Text>
                      );
                    }
                    return (
                      <Text>
                        Add{' '}
                        <Text as="strong" fontWeight="bold">
                          &quot;{value}&quot;
                        </Text>
                      </Text>
                    );
                  }}
                </TagInputCreatable>
              </TagInputList>
            </TagInput>
            {groupError.blocks && !!groupTouched?.blocks ? (
              <FormErrorMessage>{groupError.blocks}</FormErrorMessage>
            ) : (
              <FormHelperText>
                Terms that will link this group together.
              </FormHelperText>
            )}
          </FormControl>
        )}
      </Field>
      <Field name={`groups[${index}].answers`}>
        {({ field }: FieldProps<string[], { answers?: string[] }>) => (
          <FormControl
            isRequired
            isDisabled={isDisabled}
            isInvalid={!!groupError.answers && groupTouched?.answers}
          >
            <FormLabel>Answers</FormLabel>
            <TagInput
              {...field}
              isDisabled={isDisabled}
              onChange={(newValue) => {
                if (newValue.length > 8) {
                  return;
                }
                setFieldValue(field.name, newValue);
              }}
            >
              <TagInputField
                required={false}
                disabled={isDisabled}
                placeholder="Add an answer..."
                aria-invalid={!!(groupError.answers && !!groupTouched?.answers)}
                onBlur={() => {
                  setFieldTouched(field.name, true);
                }}
              >
                {({ tags }) =>
                  tags.map((tag, idx) => (
                    <TagInputTag
                      key={idx}
                      label={tag.label}
                      onRemove={() => {
                        if (isDisabled) {
                          return;
                        }

                        tag.onRemove();
                      }}
                    />
                  ))
                }
              </TagInputField>
              <TagInputList>
                <TagInputCreatable>
                  {({ value }) => {
                    if (value.length === 0) {
                      return (
                        <Text fontStyle="italic" color="text.secondary">
                          Start typing, then, hit &quot;Enter&quot; to add an
                          answer....
                        </Text>
                      );
                    }
                    return (
                      <Text>
                        Add{' '}
                        <Text as="strong" fontWeight="bold">
                          &quot;{value}&quot;
                        </Text>
                      </Text>
                    );
                  }}
                </TagInputCreatable>
              </TagInputList>
            </TagInput>
            {groupError.answers && groupTouched?.answers ? (
              <FormErrorMessage>{groupError.answers}</FormErrorMessage>
            ) : (
              <FormHelperText>
                Keep words in their shortest form to ensure that you cover as
                many answers as possible. Example{' '}
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
        )}
      </Field>
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
