import { FormikHelpers } from 'formik';

import { Group, Puzzle, PuzzleUpdatePayload } from '@/types/puzzle';

export type PuzzleUpdateFormGroupProps = {
  group: Group;
  index: number;
};

export type PuzzleUpdateFormProps = {
  isDeleting?: boolean;
  onDelete?: () => void | Promise<void>;
  onSubmit?: (
    values: PuzzleUpdatePayload,
    helpers: FormikHelpers<PuzzleUpdatePayload>
  ) => void | Promise<void>;
  puzzle: Puzzle;
};
