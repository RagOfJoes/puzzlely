import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { NextSeo } from "next-seo";

import api from "@/api";
import APIError from "@/api/error";
import { LoginContainer } from "@/containers/Login";
import { AuthLayout } from "@/layouts/Auth";
import getColorModeCookie from "@/lib/getColorModeCookie";
import { generateQueryKey } from "@/lib/queryKeys";
import type { User } from "@/types/user";

const LoginPage = () => {
  return (
    <>
      <AuthLayout
        lead="Welcome back to Puzzlely."
        caption="Log in with one of the options below to continue."
      >
        <LoginContainer />
      </AuthLayout>

      <NextSeo title="Log in" description="Log in to your Puzzlely account." />
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
    const destination = me.state === "PENDING" ? "/profile" : "/";
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
