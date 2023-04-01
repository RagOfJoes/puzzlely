import type { User } from "@/types/user";

export type GameChallengerResultsProps = {
  attempts: number;
  maxAttempts: number;
  maxScore: number;
  score: number;
  user?: User;
};
