import {
  maxAttemptsFromDifficulty,
  timeAllowedFromDifficulty,
} from '@/lib/game';
import { PuzzleCreatePayload } from '@/types/puzzle';

export const initialValues: PuzzleCreatePayload = {
  name: '',
  description: '',
  difficulty: 'Easy',
  maxAttempts: maxAttemptsFromDifficulty.Easy,
  timeAllowed: timeAllowedFromDifficulty.Easy,
  groups: [
    {
      answers: [],
      blocks: [],
      description: '',
    },
    {
      answers: [],
      blocks: [],
      description: '',
    },
    {
      answers: [],
      blocks: [],
      description: '',
    },
    {
      answers: [],
      blocks: [],
      description: '',
    },
  ],
};
