import {
  FormControl,
  FormControlProps,
  FormErrorMessage,
  FormErrorMessageProps,
  FormHelperText,
  FormLabel,
  FormLabelProps,
  HelpTextProps,
} from '@chakra-ui/react';
import { useField, useFormikContext } from 'formik';

export type FormikFormControlProps = FormControlProps & {
  helperText?: string;
  helperTextProps?: HelpTextProps;
  errorMessageProps?: FormErrorMessageProps;
  label?: string;
  labelProps?: FormLabelProps;
  name: string;
};

const FormikFormControl = (props: FormikFormControlProps) => {
  const {
    children,
    name,
    label,
    labelProps,
    helperText,
    helperTextProps,
    errorMessageProps,
    ...rest
  } = props;

  const { isSubmitting } = useFormikContext();
  const [, { error, touched }] = useField(name);

  return (
    <FormControl
      isDisabled={isSubmitting}
      isInvalid={!!error && touched}
      {...rest}
    >
      {label && (
        <FormLabel htmlFor={name} {...labelProps}>
          {label}
        </FormLabel>
      )}
      {children}
      {error && (
        <FormErrorMessage {...errorMessageProps}>{error}</FormErrorMessage>
      )}
      {(!error || !touched) && helperText && (
        <FormHelperText {...helperTextProps}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
};

export default FormikFormControl;
