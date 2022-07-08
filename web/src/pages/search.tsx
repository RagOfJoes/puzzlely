import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { NextSeo } from 'next-seo';
import { dehydrate, QueryClient } from 'react-query';

import api from '@/api';
import APIError from '@/api/error';
import SearchContainer from '@/containers/Search';
import useSearch from '@/hooks/useSearch';
import getColorModeCookie from '@/lib/getColorModeCookie';
import { generateQueryKey } from '@/lib/queryKeys';
import { PuzzleConnection } from '@/types/puzzle';
import { User } from '@/types/user';

export type SearchPageProps = {
  search: string;
};

const SearchPage = (props: SearchPageProps) => {
  const { search } = props;

  const { data: result } = useSearch(search);

  return (
    <>
      <SearchContainer
        search={search}
        result={
          result || { edges: [], pageInfo: { cursor: '', hasNextPage: false } }
        }
      />
      <NextSeo noindex nofollow title="Search" />
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SearchPageProps> = async (
  ctx
) => {
  const term = ctx.query.term;
  if (typeof term !== 'string') {
    return {
      redirect: {
        permanent: false,
        destination: '/puzzles',
      },
    };
  }

  const meKey = generateQueryKey.Me();
  const searchkey = generateQueryKey.Search(term);

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
  const searchQuery = queryClient.prefetchQuery<PuzzleConnection, APIError>(
    searchkey,
    async () => {
      const res = await api.search(ctx);
      if (!res.success || !res.payload) {
        const { error } = res;
        throw new APIError(error?.code, error?.message);
      }
      return res.payload;
    }
  );

  await Promise.all([meQuery, searchQuery]);

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
      dehydratedState: dehydrate(queryClient),
      // Local page props
      search: term,
    },
  };
};

export default SearchPage;
