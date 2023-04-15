import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { NextSeo } from "next-seo";

import api from "@/api";
import APIError from "@/api/error";
import { PuzzlesLikedContainer } from "@/containers/PuzzlesLiked";
import { MainLayout } from "@/layouts/Main";
import getColorModeCookie from "@/lib/getColorModeCookie";
import { generateQueryKey } from "@/lib/queryKeys";
import type { User } from "@/types/user";

function PuzzlesLikedPage() {
  return (
    <>
      <MainLayout
        breadcrumbLinks={[
          { path: "/puzzles", title: "Puzzles" },
          { path: "/puzzles/liked", title: "Liked" },
        ]}
      >
        <PuzzlesLikedContainer />
      </MainLayout>

      <NextSeo title="Liked Puzzles" />
    </>
  );
}

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
  if (!me) {
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
    };
  }
  if (me.state === "PENDING") {
    return {
      redirect: {
        permanent: false,
        destination: "/profile",
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

export default PuzzlesLikedPage;
