import type { Puzzle } from "@/types/puzzle";

export type PuzzleSummary = Omit<Puzzle, "groups">;
