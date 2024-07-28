export type User = {
	/**
	 * Unique identifier
	 */
	id: string;
	/**
	 * The user's current state
	 *
	 * `PENDING` - User has not chosen their username yet
	 * `COMPLETE` - User has chosen their username
	 */
	state: "PENDING" | "COMPLETE";
	/**
	 * Unique username that the user has chosen
	 */
	username: string;
	/**
	 * When the puzzle was created
	 */
	created_at: Date;
	/**
	 * If and when the puzzle was update
	 */
	updated_at?: Date | null;
};
