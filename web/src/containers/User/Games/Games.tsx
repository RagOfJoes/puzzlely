import { useMemo } from 'react';

import { Grid, GridItem, Heading } from '@chakra-ui/react';

import GameCard from '@/components/GameCard';
import Waypoint from '@/components/Waypoint';
import useGameHistory from '@/hooks/useGameHistory';
import useMe from '@/hooks/useMe';
import { GameConnection, GameEdge } from '@/types/game';
import { User } from '@/types/user';

import Loading from './Loading';

type ProfileGamesProps = {
  user: User;
};

const Games = (props: ProfileGamesProps) => {
  const { user } = props;

  const { data: me } = useMe();
  const {
    data: games,
    fetchNextPage,
    hasNextPage,
    isFetched,
    isFetchingNextPage,
    isLoading,
  } = useGameHistory(user.id);

  const connection: GameConnection = useMemo(() => {
    if (!games || games.pages.length === 0) {
      return {
        edges: [],
        pageInfo: {
          cursor: '',
          hasNextPage: false,
        },
      };
    }

    const pageInfo: GameConnection['pageInfo'] = games.pages[
      games.pages.length - 1
    ]?.pageInfo || { cursor: '', hasNextPage: false };
    const edges: GameEdge[] = [];
    games.pages.forEach((page) => {
      if (page.edges.length > 0) {
        edges.push(...page.edges);
      }
    });
    return {
      edges,
      pageInfo,
    };
  }, [games]);

  if (connection.edges.length === 0 && isFetched) {
    return (
      <Heading size="sm" color="text.secondary">
        No games played.
      </Heading>
    );
  }

  return (
    <Grid
      gap="4"
      w="100%"
      templateColumns={{
        base: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)',
        md: 'repeat(2, 1fr)',
        xl: 'repeat(3, 1fr)',
      }}
    >
      {!isFetched && isLoading && <Loading />}

      {isFetched &&
        games &&
        games.pages.length > 0 &&
        connection.edges.map((edge) => {
          const { cursor, node } = edge;

          const isPlayable = me?.id !== user.id;

          return (
            <GridItem colSpan={1} rowSpan={1} key={cursor}>
              <GameCard
                // puzzle.groups.length
                id={node.id}
                maxScore={8}
                score={node.score}
                isPlayable={isPlayable}
                name={node.puzzle.name}
                attempts={node.attempts}
                startedAt={node.startedAt!}
                completedAt={node.completedAt!}
                challengeCode={node.challengeCode}
                difficulty={node.puzzle.difficulty}
                maxAttempts={node.config.maxAttempts}
                timeAllowed={node.config.timeAllowed}
                createdBy={node.puzzle.createdBy.username}
              />
            </GridItem>
          );
        })}

      {isFetched && isFetchingNextPage && <Loading />}

      {hasNextPage && isFetched && !isLoading && (
        <Waypoint
          initialInView={false}
          onChange={(inView) => {
            if (inView) {
              fetchNextPage();
            }
          }}
        />
      )}
    </Grid>
  );
};

export default Games;
