import { Grid, GridItem } from '@chakra-ui/react';
import { useFormikContext } from 'formik';

import FormikInputControl from '@/components/FormikInputControl';
import FormikSelectControl from '@/components/FormikSelectControl';
import FormikTextareaControl from '@/components/FormikTextareaControl';
import PuzzleFormCard from '@/components/PuzzleFormCard';
import { PUZZLE_DIFFICULTIES } from '@/lib/constants';
import {
  maxAttemptsFromDifficulty,
  timeAllowedFromDifficulty,
} from '@/lib/game';
import { PuzzleCreatePayload } from '@/types/puzzle';

const Meta = () => {
  const { touched, setFieldValue } = useFormikContext<PuzzleCreatePayload>();

  return (
    <PuzzleFormCard
      title="Meta"
      caption="Fields that can either help or trick the player."
    >
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
            mt={{ base: '4', sm: '0' }}
            selectProps={{
              width: '100%',
              onChange: (e) => {
                setFieldValue('difficulty', e.target.value);

                if (!touched.maxAttempts) {
                  setFieldValue(
                    'maxAttempts',
                    maxAttemptsFromDifficulty[
                      e.target.value as PuzzleCreatePayload['difficulty']
                    ]
                  );
                }
                if (!touched.timeAllowed) {
                  setFieldValue(
                    'timeAllowed',
                    timeAllowedFromDifficulty[
                      e.target.value as PuzzleCreatePayload['difficulty']
                    ]
                  );
                }
              },
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
        mt="4"
        name="description"
        label="Description"
        textareaProps={{
          size: 'md',
          resize: 'none',
          placeholder: 'Add a description...',
        }}
      />
    </PuzzleFormCard>
  );
};

export default Meta;
