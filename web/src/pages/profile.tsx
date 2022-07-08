import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { NextSeo } from 'next-seo';
import { dehydrate, QueryClient } from 'react-query';

import api from '@/api';
import APIError from '@/api/error';
import UserContainer from '@/containers/User';
import UserSetupContainer from '@/containers/UserSetup';
import useMe from '@/hooks/useMe';
import getColorModeCookie from '@/lib/getColorModeCookie';
import { generateQueryKey } from '@/lib/queryKeys';
import { User } from '@/types/user';

export type ProfilePageProps = {
  user: User;
};

const ProfilePage = (props: ProfilePageProps) => {
  const { user } = props;

  const { data: me } = useMe();

  if ((me || user).state === 'PENDING') {
    return (
      <>
        <UserSetupContainer />
        <NextSeo noindex nofollow title="Account Setup" />
      </>
    );
  }

  return (
    <>
      <UserContainer user={me || user} />
      <NextSeo noindex nofollow title="Profile" />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<ProfilePageProps> = async (
  ctx
) => {
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
  if (!me) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
    };
  }

  return {
    props: {
      // Global props that need to be pass to every single page
      colorMode: getColorModeCookie(ctx.req.cookies),
      // Pre-fetched data for specific page
      dehydratedState: dehydrate(queryClient),
      // Local page props
      user: me,
    },
  };
};

export default ProfilePage;
