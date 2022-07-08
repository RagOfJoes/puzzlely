import { ForwardedRef, forwardRef, ReactNode } from 'react';

import {
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputProps,
  NumberInputStepper,
} from '@chakra-ui/react';
import { useField, useFormikContext } from 'formik';

import FormikFormControl, {
  FormikFormControlProps,
} from '@/components/FormikFormControl';

export type FormikNumberInputControlProps = FormikFormControlProps & {
  numberInputProps?: NumberInputProps;
  showStepper?: boolean;
  children?: ReactNode;
};

// eslint-disable-next-line react/display-name
const FormikNumberInputControl = forwardRef(
  (
    props: FormikNumberInputControlProps,
    ref: ForwardedRef<HTMLInputElement>
  ) => {
    const {
      name,
      label,
      showStepper = true,
      children,
      numberInputProps,
      ...rest
    } = props;

    const [field, { error, touched }] = useField(name);
    const { isSubmitting, setFieldValue } = useFormikContext();

    return (
      <FormikFormControl name={name} label={label} {...rest}>
        <NumberInput
          {...field}
          id={name}
          isDisabled={isSubmitting}
          isInvalid={!!error && touched}
          onChange={(value: any) => setFieldValue(name, value)}
          {...numberInputProps}
        >
          <NumberInputField ref={ref} name={name} />
          {showStepper && (
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          )}
          {children}
        </NumberInput>
      </FormikFormControl>
    );
  }
);

export default FormikNumberInputControl;
