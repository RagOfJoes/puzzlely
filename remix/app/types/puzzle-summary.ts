import type { Puzzle } from "./puzzle";

export type PuzzleSummary = Omit<Puzzle, "groups">;
