import type { Game } from "@/types/game";
import type { Puzzle } from "@/types/puzzle";

export type GameCardProps = {
  attempts: number;
  completedAt: Date;
  createdBy: string;
  difficulty: Puzzle["difficulty"];
  challengeCode: Game["challengeCode"];
  id: string;
  isPlayable?: boolean;
  maxAttempts: number;
  maxScore: number;
  name: string;
  score: number;
  startedAt: Date;
  timeAllowed: number;
};
