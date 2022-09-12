import { dehydrate, QueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { NextSeo } from 'next-seo';

import api from '@/api';
import APIError, { APIErrorCode } from '@/api/error';
import GameContainer from '@/containers/Game';
import GameErrorContainer from '@/containers/GameError';
import useGame from '@/hooks/useGame';
import MainLayout from '@/layouts/Main';
import getColorModeCookie from '@/lib/getColorModeCookie';
import isUUID from '@/lib/isUUID';
import { generateQueryKey } from '@/lib/queryKeys';
import { Game } from '@/types/game';
import { User } from '@/types/user';

export type GamePageProps = {
  id: string;
};

const GamePage = (props: GamePageProps) => {
  const { id } = props;

  const { data, error, isError, isSuccess } = useGame(id);

  if (!data || isError || !isSuccess) {
    return (
      <>
        <MainLayout
          display="flex"
          flexDirection="column"
          breadcrumbLinks={[{ path: '/puzzles', title: 'Puzzles' }]}
          sx={{
            '& > main': {
              marginY: 'auto',
            },
          }}
        >
          <GameErrorContainer
            error={
              error || new APIError(APIErrorCode.NotFound, 'Game not found.')
            }
          />
        </MainLayout>

        <NextSeo noindex nofollow title="Error" />
      </>
    );
  }

  return (
    <>
      <MainLayout
        layoutScroll
        as={motion.div}
        breadcrumbLinks={[
          { path: '/puzzles', title: 'Puzzles' },
          { path: '/', title: data.puzzle.name },
        ]}
      >
        <GameContainer game={data} />
      </MainLayout>

      <NextSeo noindex nofollow title={data.puzzle.name} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<GamePageProps> = async (
  ctx
) => {
  const gameID = ctx.query.id;
  if (typeof gameID !== 'string' || !isUUID(gameID)) {
    return {
      redirect: {
        permanent: false,
        destination: '/puzzles',
      },
    };
  }

  const meKey = generateQueryKey.Me();
  const gameKey = generateQueryKey.Game(gameID);

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
  const gameQuery = queryClient.prefetchQuery<Game, APIError>(
    gameKey,
    async () => {
      const res = await api.findGame(ctx);
      if (!res.success || !res.payload) {
        const { error } = res;
        throw new APIError(error?.code, error?.message);
      }
      return res.payload;
    }
  );

  await Promise.all([meQuery, gameQuery]);

  const me = queryClient.getQueryData<User>(meKey);
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
      dehydratedState: dehydrate(queryClient, {}),
      // Local page props
      id: gameID,
    },
  };
};

export default GamePage;
