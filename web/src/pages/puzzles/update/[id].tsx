import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { NextSeo } from 'next-seo';
import { dehydrate, QueryClient } from 'react-query';

import api from '@/api';
import APIError, { APIErrorCode } from '@/api/error';
import PuzzleUpdateContainer from '@/containers/PuzzleUpdate';
import PuzzleUpdateErrorContainer from '@/containers/PuzzleUpdateError';
import usePuzzle from '@/hooks/usePuzzle';
import getColorModeCookie from '@/lib/getColorModeCookie';
import isUUID from '@/lib/isUUID';
import { generateQueryKey } from '@/lib/queryKeys';
import { Puzzle } from '@/types/puzzle';
import { User } from '@/types/user';

export type PuzzleUpdatePageProps = {
  id: string;
};

const PuzzleUpdatePage = (props: PuzzleUpdatePageProps) => {
  const { id } = props;

  const { data, error, isError, isSuccess } = usePuzzle(id);

  if (!data || isError || !isSuccess) {
    return (
      <>
        <PuzzleUpdateErrorContainer
          error={
            error || new APIError(APIErrorCode.NotFound, 'Puzzle not found.')
          }
        />
        <NextSeo noindex nofollow title="Error" />
      </>
    );
  }

  return (
    <>
      <PuzzleUpdateContainer puzzle={data} />
      <NextSeo noindex nofollow title="Update Puzzle" />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  PuzzleUpdatePageProps
> = async (ctx) => {
  const puzzleID = ctx.query.id;
  if (typeof puzzleID !== 'string' || !isUUID(puzzleID)) {
    return {
      redirect: {
        permanent: false,
        destination: '/puzzles',
      },
    };
  }

  const meKey = generateQueryKey.Me();
  const puzzleKey = generateQueryKey.PuzzleDetail(puzzleID);

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
  const puzzleQuery = queryClient.prefetchQuery<Puzzle, APIError>(
    puzzleKey,
    async () => {
      const res = await api.findPuzzle(ctx);
      if (!res.success || !res.payload) {
        const { error } = res;
        throw new APIError(error?.code, error?.message);
      }
      return res.payload;
    }
  );

  await Promise.all([meQuery, puzzleQuery]);

  const me = queryClient.getQueryData<User>(meKey);
  if (!me) {
    return {
      redirect: {
        permanent: false,
        destination: '/login',
      },
    };
  }
  if (me.state === 'PENDING') {
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
      dehydratedState: dehydrate(queryClient, {}),
      // Local page props
      id: puzzleID,
    },
  };
};

export default PuzzleUpdatePage;
