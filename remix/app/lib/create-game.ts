import { ulid } from "ulid";

import type { Game } from "@/types/game";
import type { Puzzle } from "@/types/puzzle";
import type { User } from "@/types/user";

export type CreateGameArgs = {
	me?: User;
	puzzle: Puzzle;
};

/**
 * Creates a new game given the currently authenticated user and the puzzle
 *
 * @param args - The arguments
 * @param args.me - The currently authenticated user
 * @param args.puzzle - The puzzle to create the game for
 * @returns The newly created game
 */
export function createGame({ me, puzzle }: CreateGameArgs): Game {
	const newGame = {
		id: ulid(),
		challenge_code: "",
		score: 0,
		attempts: [],
		correct: [],

		created_at: new Date(),

		puzzle,
		user: undefined as User | undefined,
	};

	if (me) {
		newGame.user = me;
	}

	return newGame satisfies Game;
}
