import type { Game } from "@/types/game";
import type { PuzzleSummary } from "@/types/puzzle-summary";

export type GameSummary = Omit<Game, "attempts" | "correct" | "puzzle"> & {
	attempts: number;

	puzzle: PuzzleSummary;
};
