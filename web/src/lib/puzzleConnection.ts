import type {
  InfiniteData,
  QueryClient,
  QueryFilters,
} from "@tanstack/react-query";
import dayjs from "dayjs";

import type { PuzzleConnection, PuzzleNode } from "@/types/puzzle";

function toggleLikeNode(id: string, node: PuzzleNode): PuzzleNode {
  if (node.id !== id) {
    return node;
  }

  const isLiked = node.likedAt;
  return {
    ...node,
    likedAt: isLiked ? null : dayjs().tz().toDate(),
    numOfLikes: isLiked ? node.numOfLikes - 1 : node.numOfLikes + 1,
  };
}

function updateNode(newNode: PuzzleNode, oldNode: PuzzleNode): PuzzleNode {
  if (oldNode.id !== newNode.id) {
    return oldNode;
  }
  return {
    ...oldNode,
    ...newNode,
  };
}

export async function toggleLikePuzzleConnection(
  id: string,
  queryClient: QueryClient,
  queryFilters: QueryFilters
): Promise<void> {
  // Cancel any outgoing refetches so they don't overwrite our optimistic update
  await queryClient.cancelQueries(queryFilters);

  queryClient.setQueriesData<PuzzleConnection | undefined>(
    queryFilters,
    (old) => {
      if (!old) {
        return old;
      }
      return {
        ...old,
        edges: old.edges.map((edge) => ({
          ...edge,
          node: toggleLikeNode(id, edge.node),
        })),
      };
    }
  );
}

export async function toggleLikePuzzlePages(
  id: string,
  queryClient: QueryClient,
  queryFilters: QueryFilters
): Promise<void> {
  // Cancel any outgoing refetches so they don't overwrite our optimistic update
  await queryClient.cancelQueries(queryFilters);

  queryClient.setQueriesData<InfiniteData<PuzzleConnection> | undefined>(
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
            edges: page.edges.map((edge) => ({
              ...edge,
              node: toggleLikeNode(id, edge.node),
            })),
          };
        }),
      };
    }
  );
}

export async function updatePuzzlePages(
  update: PuzzleNode | ((node: PuzzleNode) => PuzzleNode),
  queryClient: QueryClient,
  queryFilters: QueryFilters
): Promise<void> {
  // Cancel any outgoing refetches so they don't overwrite our optimistic update
  await queryClient.cancelQueries(queryFilters);

  queryClient.setQueriesData<InfiniteData<PuzzleConnection> | undefined>(
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
              if (typeof update === "function") {
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
}
