import { InfiniteData, QueryClient, QueryFilters } from '@tanstack/react-query';

import { GameConnection, GameNode } from '@/types/game';

const updateNode = (newNode: GameNode, oldNode: GameNode): GameNode => {
  if (oldNode.id !== newNode.id) {
    return oldNode;
  }
  return {
    ...oldNode,
    ...newNode,
  };
};

export const updateGameConnection = async (
  update: GameNode | ((node: GameNode) => GameNode),
  queryClient: QueryClient,
  queryFilters: QueryFilters
): Promise<void> => {
  // Cancel any outgoing refetches so they don't overwrite our optimistic update
  await queryClient.cancelQueries(queryFilters);

  queryClient.setQueriesData<InfiniteData<GameConnection> | undefined>(
    queryFilters,
    (old) => {
      if (!old) {
        return old;
      }
      return {
        ...old,
        pages: old.pages.map((page) => {
          return {
            ...page,
            edges: page.edges.map((edge) => {
              if (typeof update === 'function') {
                return {
                  ...edge,
                  node: update(edge.node),
                };
              }
              return {
                ...edge,
                node: updateNode(update, edge.node),
              };
            }),
          };
        }),
      };
    }
  );
};
