import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { NextSeo } from 'next-seo';
import { dehydrate, QueryClient } from 'react-query';

import api from '@/api';
import APIError from '@/api/error';
import LoginContainer from '@/containers/Login';
import getColorModeCookie from '@/lib/getColorModeCookie';
import { generateQueryKey } from '@/lib/queryKeys';
import { User } from '@/types/user';

const LoginPage = () => {
  return (
    <>
      <LoginContainer />
      <NextSeo
        title="Log in"
        description="Log in to your Puzzlely account."
        robotsProps={{
          nosnippet: true,
        }}
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
  if (me) {
    const destination = me.state === 'PENDING' ? '/profile' : '/';
    return {
      redirect: {
        permanent: false,
        destination,
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

export default LoginPage;
