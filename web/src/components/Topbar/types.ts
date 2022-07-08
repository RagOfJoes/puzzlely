import { Dispatch, SetStateAction } from 'react';

import { FormikHelpers } from 'formik';

export type TopbarSearchForm = {
  search: string;
};

export type TopbarProps = {
  links: { path: string; title: string }[];
  onSearch?: (
    values: TopbarSearchForm,
    helpers: FormikHelpers<TopbarSearchForm>
  ) => void | Promise<void>;
  open: boolean;
  toggleOpen: Dispatch<SetStateAction<boolean>>;
};
