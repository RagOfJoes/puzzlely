import { NextSeo } from 'next-seo';

import NotFoundContainer from '@/containers/NotFound';

const NotFoundPage = () => {
  return (
    <>
      <NotFoundContainer />
      <NextSeo noindex nofollow title="Not Found" />
    </>
  );
};

export default NotFoundPage;
