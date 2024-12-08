import type { Game } from "./game";
import type { PuzzleSummary } from "./puzzle-summary";

export type GameSummary = Omit<Game, "attempts" | "correct" | "puzzle"> & {
	attempts: number;

	puzzle: PuzzleSummary;
};
