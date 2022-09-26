import { FormikContextType, FormikHelpers } from 'formik';

import { PuzzleCreatePayload } from '@/types/puzzle';

export type PuzzleCreateFormGroupProps = {
  group: PuzzleCreatePayload['groups'] extends readonly (infer ElementType)[]
    ? ElementType
    : never;
  errors: {
    answers?: string;
    blocks?: string;
    description?: string;
  };
  isDisabled?: boolean;
  index: number;
  setFieldTouched: FormikContextType<PuzzleCreatePayload>['setFieldTouched'];
  setFieldValue: FormikContextType<PuzzleCreatePayload>['setFieldValue'];
  touched: {
    answers?: boolean;
    blocks?: boolean;
    description?: boolean;
  };
};

export type PuzzleCreateFormProps = {
  initialValues: PuzzleCreatePayload;
  onSubmit?: (
    values: PuzzleCreatePayload,
    helpers: FormikHelpers<PuzzleCreatePayload>
  ) => void | Promise<void>;
};
