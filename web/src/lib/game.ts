import { Puzzle } from '@/types/puzzle';

export const difficultyColor: { [key in Puzzle['difficulty']]: string } = {
  Hard: 'red',
  Medium: 'yellow',
  Easy: 'green',
};

/**
 * Default max attempts depending on Puzzle's difficulty
 */
export const maxAttemptsFromDifficulty: {
  [key in Puzzle['difficulty']]: number;
} = {
  Hard: 12,
  Medium: 18,
  Easy: 24,
};

/**
 * Default time duration from puzzle's difficulty
 */
export const timeAllowedFromDifficulty: {
  [key in Puzzle['difficulty']]: number;
} = {
  Hard: 180000,
  Medium: 300000,
  Easy: 600000,
};
