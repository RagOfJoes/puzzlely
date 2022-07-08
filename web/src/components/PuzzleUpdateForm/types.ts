import { FormikHelpers } from 'formik';

import { Puzzle, PuzzleUpdatePayload } from '@/types/puzzle';

export type PuzzleUpdateFormProps = {
  isDeleting?: boolean;
  onDelete?: () => void | Promise<void>;
  onSubmit?: (
    values: PuzzleUpdatePayload,
    helpers: FormikHelpers<PuzzleUpdatePayload>
  ) => void | Promise<void>;
  puzzle: Puzzle;
};
