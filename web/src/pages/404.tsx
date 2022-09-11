import { Icon } from '@chakra-ui/react';
import { NextSeo } from 'next-seo';

import NotFoundIcon from '@/components/NotFoundIcon';
import NotFoundContainer from '@/containers/NotFound';
import ErrorLayout from '@/layouts/Error';

const NotFoundPage = () => {
  return (
    <>
      <ErrorLayout
        lead="Page Not Found..."
        caption="Hmmm... Seems you're a bit lost. Let's get you back on track."
        icon={
          <Icon
            h="auto"
            w="100%"
            maxH="250px"
            as={NotFoundIcon}
            aria-label="Not Found"
          />
        }
      >
        <NotFoundContainer />
      </ErrorLayout>

      <NextSeo noindex nofollow title="Not Found" />
    </>
  );
};

export default NotFoundPage;
