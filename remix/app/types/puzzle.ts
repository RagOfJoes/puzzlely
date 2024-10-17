import type { User } from "./user";

export type PuzzleBlock = {
	/**
	 * Unique identifier
	 */
	id: string;
	/**
	 * Unique identifier of the group that this block belongs to
	 */
	puzzle_group_id: string;
	/**
	 * Text that will be displayed in the UI
	 */
	value: string;
};

export type PuzzleGroup = {
	/**
	 * Unique identifier
	 */
	id: string;
	/**
	 * Description for the group that describes the connection between blocks
	 */
	description: string;
	/**
	 * Blocks that belongs to this group
	 */
	blocks: PuzzleBlock[];
};

export type Puzzle = {
	/**
	 * Unique identifier
	 */
	id: string;
	/**
	 * Difficulty of the connection between blocks
	 */
	difficulty: "Easy" | "Medium" | "Hard";
	/**
	 * Restricts the number of attempts a user can make. If this isn't explicitly set, then the `difficulty` will be used to determine the number of attempts.
	 */
	max_attempts: number;
	/**
	 * Number of likes
	 */
	num_of_likes: number;
	/**
	 * Whether user has liked Puzzle
	 */
	liked_at?: Date | null;
	/**
	 * When the puzzle was created
	 */
	created_at: Date;
	/**
	 * If and when the puzzle was update
	 */
	updated_at?: Date;
	/**
	 * Group of blocks. For now, this is limited to 4.
	 *
	 * TODO: Allow this to be customizable
	 */
	groups: PuzzleGroup[];
	/**
	 * Who created the puzzle
	 */
	created_by: User;
};
