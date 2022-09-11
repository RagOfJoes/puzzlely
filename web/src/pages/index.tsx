import { dehydrate, QueryClient } from '@tanstack/react-query';
import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { NextSeo, SiteLinksSearchBoxJsonLd } from 'next-seo';

import api from '@/api';
import APIError from '@/api/error';
import HomeContainer from '@/containers/Home';
import MainLayout from '@/layouts/Main';
import getColorModeCookie from '@/lib/getColorModeCookie';
import { generateQueryKey } from '@/lib/queryKeys';
import { User } from '@/types/user';

const HomePage = () => {
  return (
    <>
      <MainLayout breadcrumbLinks={[{ path: '/', title: 'Home' }]}>
        <HomeContainer />
      </MainLayout>

      <NextSeo />
      <SiteLinksSearchBoxJsonLd
        url={`${process.env.NEXT_PUBLIC_HOST_URL}/`}
        potentialActions={[
          {
            target: `${process.env.NEXT_PUBLIC_HOST_URL}/search?term`,
            queryInput: 'search_term_string',
          },
        ]}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const key = generateQueryKey.Me();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery<User, APIError>(key, async () => {
    const res = await api.me(
      ctx.req as NextApiRequest,
      ctx.res as NextApiResponse
    );
    if (!res.success || !res.payload?.user) {
      const { error } = res;
      throw new APIError(error?.code, error?.message);
    }
    return res.payload.user;
  });

  const me = queryClient.getQueryData<User>(key);
  if (me && me.state === 'PENDING') {
    return {
      redirect: {
        permanent: false,
        destination: '/profile',
      },
    };
  }

  return {
    props: {
      // Global props that need to be pass to every single page
      colorMode: getColorModeCookie(ctx.req.cookies),
      // Pre-fetched data for specific page
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default HomePage;
