import { Icon } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';

import InternalErrorIcon from '@/components/InternalErrorIcon';
import InternalErrorContainer from '@/containers/InternalError';
import ErrorLayout from '@/layouts/Error';

const InternalErrorPage = () => {
  return (
    <>
      <ErrorLayout
        lead="Internal Error..."
        caption="Oops! Sorry, unexpected error. Please try again later."
        icon={
          <Icon
            h="auto"
            w="100%"
            maxH="250px"
            as={InternalErrorIcon}
            aria-label="Internal Error"
          />
        }
      >
        <InternalErrorContainer />
      </ErrorLayout>

      <NextSeo noindex nofollow title="Oops!" />
    </>
  );
};

export default InternalErrorPage;
