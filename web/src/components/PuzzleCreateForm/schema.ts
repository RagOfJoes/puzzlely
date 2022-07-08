import * as yup from 'yup';

import { PUZZLE_DIFFICULTIES } from '@/lib/constants';

const schema = yup.object().shape({
  name: yup
    .string()
    .min(1, 'Must have at least 1 character!')
    .max(64, 'Must not have more than 64 characters!')
    .matches(/^[\w\-\s]+$/, 'Can only contain numbers, letters, and spaces!')
    .required('Required!'),
  description: yup.string().max(512, 'Must not have more than 512 characters!'),
  difficulty: yup
    .string()
    .oneOf(
      PUZZLE_DIFFICULTIES,
      `Must be one of: ${PUZZLE_DIFFICULTIES.join(', ')}.`
    )
    .required('Required!'),
  maxAttempts: yup
    .number()
    .min(0, 'Must be greater than 0!')
    .max(999, 'Must be less than 999!'),
  timeAllowed: yup
    .number()
    .min(0, 'Must be greater than 0!')
    .max(3599000, 'Must be less than 3599000!'),
  groups: yup
    .array(
      yup.object().shape({
        answers: yup
          .array(
            yup
              .string()
              .min(1, 'Must have at least 1 character!')
              .max(48, 'Must not have more than 48 characters!')
              .matches(
                /^[\w\-\s]+$/,
                'Can only contain numbers, letters, and spaces!'
              )
              .required()
          )
          .min(1, 'Each group must have at least 1 answer!')
          .max(8, 'Each group can only have a max of 8 answers!')
          .required('Required!'),
        description: yup
          .string()
          .min(1, 'Must have at least 1 character!')
          .max(512, 'Must not have more than 512 characters!')
          .required('Required!'),
        blocks: yup
          .array(
            yup.object().shape({
              value: yup
                .string()
                .min(1, 'Must have at least 1 character!')
                .max(48, 'Must not have more than 48 characters!')
                .matches(
                  /^[\w\-\s]+$/,
                  'Can only contain numbers, letters, and spaces!'
                )
                .required(),
            })
          )
          .length(4, 'Each group must have 4 blocks!'),
      })
    )
    .length(4, 'Must have 4 puzzle groups!')
    .required(),
});

export default schema;
