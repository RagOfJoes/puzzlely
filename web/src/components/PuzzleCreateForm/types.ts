import { FormikHelpers } from 'formik';

import { PuzzleCreatePayload } from '@/types/puzzle';

export type PuzzleCreateFormProps = {
  initialValues: PuzzleCreatePayload;
  onSubmit?: (
    values: PuzzleCreatePayload,
    helpers: FormikHelpers<PuzzleCreatePayload>
  ) => void | Promise<void>;
};
