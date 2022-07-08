import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { NextSeo } from 'next-seo';

import api from '@/api';
import isUUID from '@/lib/isUUID';

const PlayPage = () => <NextSeo noindex nofollow />;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const puzzleID = ctx.query.id;
  if (typeof puzzleID !== 'string' || !isUUID(puzzleID)) {
    return {
      redirect: {
        permanent: false,
        destination: '/puzzles',
      },
    };
  }

  const [game, me] = await Promise.all([
    api.createGame(ctx),
    api.me(ctx.req as NextApiRequest, ctx.res as NextApiResponse),
  ]);
  if (me.success && me?.payload?.user?.state === 'PENDING') {
    return {
      redirect: {
        permanent: false,
        destination: '/profile',
      },
    };
  }

  if (!game.success || !game?.payload) {
    return {
      redirect: {
        permanent: false,
        destination: '/puzzles',
      },
    };
  }

  return {
    redirect: {
      permanent: false,
      destination: `/games/${game.payload.id}`,
    },
  };
};

export default PlayPage;
