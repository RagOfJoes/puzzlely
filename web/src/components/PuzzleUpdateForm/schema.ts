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
  groups: yup
    .array(
      yup.object().shape({
        description: yup
          .string()
          .min(1, 'Must have at least 1 character!')
          .max(512, 'Must not have more than 512 characters!')
          .required('Required!'),
      })
    )
    .length(4, 'Must have 4 puzzle groups!')
    .required(),
});

export default schema;
