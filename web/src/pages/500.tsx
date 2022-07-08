import { NextSeo } from 'next-seo';

import InternalErrorContainer from '@/containers/InternalError';

const InternalErrorPage = () => {
  return (
    <>
      <InternalErrorContainer />
      <NextSeo noindex nofollow title="Oops!" />
    </>
  );
};

export default InternalErrorPage;
