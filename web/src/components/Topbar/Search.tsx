import { useMemo } from 'react';

import {
  FormControl,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from '@chakra-ui/react';
import { Field, FieldProps, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { IoSearch } from 'react-icons/io5';
import * as yup from 'yup';

import { TopbarProps, TopbarSearchForm } from './types';

const schema = yup.object().shape({
  search: yup.string().max(64, 'Must not have more than 64 characters!'),
});

const Search = (props: Pick<TopbarProps, 'onSearch'>) => {
  const { onSearch = () => {} } = props;

  const router = useRouter();

  const initialValue: TopbarSearchForm = useMemo(() => {
    const term = router.query.term;
    if (typeof term === 'string') {
      return { search: term };
    }
    return { search: '' };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hover = useColorModeValue('blackAlpha.50', 'whiteAlpha.300');

  return (
    <Formik
      validationSchema={schema}
      initialValues={initialValue}
      onSubmit={onSearch}
    >
      <Form>
        <Field name="search">
          {({ field, form }: FieldProps<string, { search: string }>) => (
            <FormControl
              isInvalid={!!form.errors.search && form.touched.search}
            >
              <InputGroup variant="filled" placeholder="Search">
                <InputLeftElement pointerEvents="none">
                  <Icon as={IoSearch} />
                </InputLeftElement>
                <Input
                  {...field}
                  bg="surface"
                  type="search"
                  maxLength={64}
                  autoComplete="off"
                  placeholder="Search"
                  aria-label="Search for a puzzle"
                  id={`Topbar__${field.name}`}
                  _hover={{
                    bg: hover,
                  }}
                />
              </InputGroup>
            </FormControl>
          )}
        </Field>
      </Form>
    </Formik>
  );
};

export default Search;
