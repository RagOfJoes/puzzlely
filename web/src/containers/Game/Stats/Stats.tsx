import { memo } from 'react';

import { Grid, GridItem, Icon } from '@chakra-ui/react';
import { IoHeart, IoTime } from 'react-icons/io5';

import GameStatCard from '@/components/GameStatCard';
import {
  UNLIMITED_MAX_ATTEMPTS,
  UNLIMITED_TIME_ALLOWED,
} from '@/lib/constants';
import { formatTime } from '@/lib/time';

import { StatsProps } from '../types';
import Shortcuts from './Shortcuts';

const Stats = (props: StatsProps) => {
  const { game, isRunning, minutes, onForfeit, onReset, onShuffle, seconds } =
    props;
  const { attempts, completedAt, config, guessedAt, startedAt } = game;

  return (
    <Grid
      w="100%"
      gap="2"
      templateColumns="repeat(4, 1fr)"
      transition="0.4s linear opacity"
      opacity={
        (!guessedAt && !startedAt) || (!isRunning && startedAt) ? 0.4 : 1
      }
    >
      <GridItem
        colSpan={{
          base: 4,
          md: 2,
        }}
      >
        <Shortcuts
          game={{ completedAt, guessedAt, startedAt }}
          onReset={onReset}
          onShuffle={onShuffle}
          onForfeit={onForfeit}
        />
      </GridItem>
      <GridItem colSpan={{ base: 2, md: 1 }} colStart={{ base: 1, md: 3 }}>
        <GameStatCard
          label="Attempts"
          icon={<Icon as={IoHeart} />}
          body={
            config.maxAttempts === UNLIMITED_MAX_ATTEMPTS
              ? 'Unlimited'
              : `${config.maxAttempts - attempts.length}`
          }
        />
      </GridItem>
      <GridItem colSpan={{ base: 2, md: 1 }}>
        <GameStatCard
          label="Time"
          icon={<Icon as={IoTime} />}
          body={
            config.timeAllowed === UNLIMITED_TIME_ALLOWED
              ? 'Unlimited'
              : `${formatTime(minutes)}:${formatTime(seconds)}`
          }
        />
      </GridItem>
    </Grid>
  );
};

export default memo(Stats);
