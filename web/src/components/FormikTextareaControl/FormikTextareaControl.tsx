import { ForwardedRef, forwardRef } from 'react';

import { Textarea, TextareaProps } from '@chakra-ui/react';
import { useField } from 'formik';

import FormikFormControl, {
  FormikFormControlProps,
} from '@/components/FormikFormControl';

export type FormikTextareaControlProps = FormikFormControlProps & {
  textareaProps?: TextareaProps;
};

// eslint-disable-next-line react/display-name
const FormikTextareaControl = forwardRef(
  (
    props: FormikTextareaControlProps,
    ref: ForwardedRef<HTMLTextAreaElement>
  ) => {
    const { label, name, textareaProps, ...other } = props;

    const [field] = useField(name);

    return (
      <FormikFormControl name={name} label={label} {...other}>
        <Textarea {...field} id={name} {...textareaProps} ref={ref} />
      </FormikFormControl>
    );
  }
);

export default FormikTextareaControl;
