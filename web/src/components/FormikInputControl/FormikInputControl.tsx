import { ForwardedRef, forwardRef } from 'react';

import { Input, InputProps } from '@chakra-ui/react';
import { useField } from 'formik';

import FormikFormControl, {
  FormikFormControlProps,
} from '@/components/FormikFormControl';

export type FormikInputControlProps = FormikFormControlProps & {
  inputProps?: InputProps;
};

// eslint-disable-next-line react/display-name
const FormikInputControl = forwardRef(
  (props: FormikInputControlProps, ref: ForwardedRef<HTMLInputElement>) => {
    const { name, label, inputProps, ...rest } = props;

    const [field] = useField(name);

    return (
      <FormikFormControl name={name} label={label} {...rest}>
        <Input {...field} id={name} {...inputProps} ref={ref} />
      </FormikFormControl>
    );
  }
);

export default FormikInputControl;
