import type { Puzzle } from "@/types/puzzle";
import type { User } from "@/types/user";

export type Game = {
	/**
	 * Unique identifier
	 */
	id: string;
	/**
	 * User's score for the game
	 */
	score: number;
	/**
	 * Number of attempts before `completedAt` has been set
	 */
	attempts: string[][];
	/**
	 * Group ids that the user was able to select correctly
	 */
	correct: string[];
	/**
	 * When game was created
	 */
	created_at: Date;
	/**
	 * This is set when the user has either given up, run out of lives, or, the user has made all the proper connections
	 */
	completed_at?: Date | null;

	/**
	 * Puzzle that this game is for
	 */
	puzzle: Puzzle;
	/**
	 * User that this game belongs to
	 */
	user: User;
};
