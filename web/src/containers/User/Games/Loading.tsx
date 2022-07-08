import { memo, useMemo } from 'react';

import { GridItem, Skeleton } from '@chakra-ui/react';
import dayjs from 'dayjs';

import GameCard from '@/components/GameCard';
import { GAMES_LIMIT, LOADING_DATE_PLACEHOLDER } from '@/lib/constants';

const Loading = () => {
  const today = useMemo(
    () => dayjs(LOADING_DATE_PLACEHOLDER).tz().toDate(),
    []
  );

  return (
    <>
      {Array.from({ length: GAMES_LIMIT }).map((_, idx) => {
        return (
          <Skeleton key={`Games__Loading__${idx}`}>
            <GridItem
              w="100%"
              h="100%"
              colSpan={1}
              rowSpan={1}
              boxShadow="sm"
              overflow="hidden"
            >
              <GameCard
                id=""
                score={0}
                attempts={0}
                maxScore={0}
                timeAllowed={0}
                maxAttempts={0}
                challengeCode=""
                createdBy="Lorem"
                startedAt={today}
                name="Puzzle name"
                completedAt={today}
                difficulty="Medium"
              />
            </GridItem>
          </Skeleton>
        );
      })}
    </>
  );
};

export default memo(Loading);
