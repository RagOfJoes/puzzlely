import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { NextSeo } from "next-seo";

import api from "@/api";
import APIError from "@/api/error";
import { UserContainer } from "@/containers/User";
import { MainLayout } from "@/layouts/Main";
import { USERNAME_SCHEMA } from "@/lib/constants";
import getColorModeCookie from "@/lib/getColorModeCookie";
import { generateQueryKey } from "@/lib/queryKeys";
import type { User } from "@/types/user";

export type UserPageProps = {
  user: User;
};

const UserPage = (props: UserPageProps) => {
  const { user } = props;

  return (
    <>
      <MainLayout
        breadcrumbLinks={[
          { path: "/profile", title: "Profile" },
          { path: `/users/${user.username}`, title: user.username },
        ]}
      >
        <UserContainer user={user} />
      </MainLayout>

      <NextSeo
        title={user.username}
        description={`View ${user.username}'s stats, achievements, created Puzzles, and played Games.`}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<UserPageProps> = async (
  ctx
) => {
  const search = ctx.query.username;
  if (!USERNAME_SCHEMA.safeParse(search).success) {
    return {
      notFound: true,
    };
  }

  const username = search as string;

  const meKey = generateQueryKey.Me();
  const profileKey = generateQueryKey.UsersProfile(username);

  const queryClient = new QueryClient();
  const meQuery = queryClient.prefetchQuery<User, APIError>(meKey, async () => {
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
  const userQuery = queryClient.prefetchQuery<User, APIError>(
    profileKey,
    async () => {
      const res = await api.findUser(ctx);
      if (!res.success || !res.payload) {
        const { error } = res;
        throw new APIError(error?.code, error?.message);
      }
      return res.payload;
    }
  );

  await Promise.all([meQuery, userQuery]);

  const me = queryClient.getQueryData<User>(meKey);
  if (
    me &&
    (me.state === "PENDING" ||
      me.username.toLowerCase() === username.toLowerCase())
  ) {
    return {
      redirect: {
        permanent: false,
        destination: "/profile",
      },
    };
  }

  const user = queryClient.getQueryData<User>(profileKey);
  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      // Global props that need to be pass to every single page
      colorMode: getColorModeCookie(ctx.req.cookies),
      // Pre-fetched data for specific page
      dehydratedState: dehydrate(queryClient),
      // Local page props
      user,
    },
  };
};

export default UserPage;
