import { memo, useMemo } from 'react';

import { GridItem, Skeleton } from '@chakra-ui/react';
import dayjs from 'dayjs';

import PuzzleCard from '@/components/PuzzleCard';
import { LOADING_DATE_PLACEHOLDER, PUZZLES_LIMIT } from '@/lib/constants';

const Loading = () => {
  const today = useMemo(
    () => dayjs(LOADING_DATE_PLACEHOLDER).tz().toDate(),
    []
  );

  return (
    <>
      {Array.from({ length: PUZZLES_LIMIT }).map((_, idx) => {
        return (
          <Skeleton key={`Puzzles__Loading__${idx}`}>
            <GridItem
              w="100%"
              h="100%"
              colSpan={1}
              rowSpan={1}
              boxShadow="sm"
              overflow="hidden"
            >
              <PuzzleCard
                id=""
                numOfLikes={0}
                maxAttempts={0}
                timeAllowed={0}
                createdAt={today}
                difficulty="Easy"
                createdBy="Lorem"
                name="Lorem Ipsum"
              />
            </GridItem>
          </Skeleton>
        );
      })}
    </>
  );
};

export default memo(Loading);
