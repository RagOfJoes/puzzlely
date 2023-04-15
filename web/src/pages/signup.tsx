import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { NextSeo } from "next-seo";

import api from "@/api";
import APIError from "@/api/error";
import { SignupContainer } from "@/containers/Signup";
import { AuthLayout } from "@/layouts/Auth";
import getColorModeCookie from "@/lib/getColorModeCookie";
import { generateQueryKey } from "@/lib/queryKeys";
import type { User } from "@/types/user";

const SignupPage = () => {
  return (
    <>
      <AuthLayout
        lead="Welcome to Puzzlely."
        caption="Sign up now by selecting one of the options below."
      >
        <SignupContainer />
      </AuthLayout>

      <NextSeo
        title="Sign up"
        description="Create an account with Puzzlely and become a part of the community! Submit your own puzzles and see how other users fare against them."
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

export default SignupPage;
