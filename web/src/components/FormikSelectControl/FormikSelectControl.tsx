import { ForwardedRef, forwardRef, ReactNode } from 'react';

import { Select, SelectProps } from '@chakra-ui/react';
import { useField } from 'formik';

import FormikFormControl, {
  FormikFormControlProps,
} from '@/components/FormikFormControl';

export type FormikSelectControlProps = FormikFormControlProps & {
  selectProps?: SelectProps;
  children: ReactNode;
};

// eslint-disable-next-line react/display-name
const FormikSelectControl = forwardRef(
  (props: FormikSelectControlProps, ref: ForwardedRef<HTMLSelectElement>) => {
    const { children, label, name, selectProps, ...other } = props;

    const [field] = useField(name);

    return (
      <FormikFormControl name={name} label={label} {...other}>
        <Select {...field} id={name} {...selectProps} ref={ref}>
          {children}
        </Select>
      </FormikFormControl>
    );
  }
);

export default FormikSelectControl;
