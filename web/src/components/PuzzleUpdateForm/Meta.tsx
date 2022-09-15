import { Grid, GridItem, VStack } from '@chakra-ui/react';

import FormikInputControl from '@/components/FormikInputControl';
import FormikSelectControl from '@/components/FormikSelectControl';
import FormikTextareaControl from '@/components/FormikTextareaControl';
import PuzzleFormCard from '@/components/PuzzleFormCard';
import { PUZZLE_DIFFICULTIES } from '@/lib/constants';

const Meta = () => {
  return (
    <PuzzleFormCard
      title="Meta"
      caption="Fields that can either help or trick the player."
    >
      <VStack mt="4" w="100%" spacing="4" align="start">
        <Grid w="100%" gap="2" templateColumns="repeat(4, 1fr)">
          <GridItem colSpan={{ base: 4, sm: 3 }}>
            <FormikInputControl
              isRequired
              name="name"
              label="Name"
              helperText="Use proper words to improve the searchability of your puzzle."
              inputProps={{
                autoComplete: 'off',
                placeholder: 'Add a name...',
              }}
            />
          </GridItem>
          <GridItem colSpan={{ base: 4, sm: 1 }}>
            <FormikSelectControl
              isRequired
              name="difficulty"
              label="Difficulty"
              selectProps={{
                width: '100%',
              }}
            >
              {PUZZLE_DIFFICULTIES.map((value) => (
                <option value={value} key={`difficulty_${value}`}>
                  {value}
                </option>
              ))}
            </FormikSelectControl>
          </GridItem>
        </Grid>

        <FormikTextareaControl
          name="description"
          label="Description"
          textareaProps={{
            size: 'md',
            resize: 'none',
            placeholder: 'Add a description...',
          }}
        />
      </VStack>
    </PuzzleFormCard>
  );
};

export default Meta;
