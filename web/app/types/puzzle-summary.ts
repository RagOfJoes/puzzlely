import type { Puzzle } from "@/types/puzzle";

export type PuzzleSummary = Omit<Puzzle, "groups" | "liked_at"> & {
	me_liked_at?: Date | null;
	user_liked_at?: Date | null;
};
