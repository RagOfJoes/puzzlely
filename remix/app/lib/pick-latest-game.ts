import { GamePayloadSchema, type GamePayload } from "@/types/game-payload";

const empty: GamePayload = {
	attempts: [],
	correct: [],
	score: 0,
};

/**
 * Picks the latest `game` between the server's response and the user's localStorage
 */
export function pickLatestGame(
	loaderGame?: GamePayload,
	localStorageGame?: GamePayload,
): GamePayload {
	if (!loaderGame && !localStorageGame) {
		return empty;
	}

	const loaderGameParsed = GamePayloadSchema.safeParse(loaderGame);
	const localStorageGameParsed = GamePayloadSchema.safeParse(localStorageGame);
	if (!loaderGameParsed.success && !localStorageGameParsed.success) {
		return empty;
	}

	if (!loaderGameParsed.success && localStorageGameParsed.success) {
		return localStorageGameParsed.data;
	}
	if (!localStorageGameParsed.success && loaderGameParsed.success) {
		return loaderGameParsed.data;
	}

	// Check which one has already been completed
	if (!!loaderGameParsed.data!.completed_at && !localStorageGameParsed.data!.completed_at) {
		return loaderGameParsed.data!;
	}
	if (!!localStorageGameParsed.data!.completed_at && !loaderGameParsed.data!.completed_at) {
		return localStorageGameParsed.data!;
	}

	return loaderGameParsed.data!.attempts.length >= localStorageGameParsed.data!.attempts.length
		? loaderGameParsed.data!
		: localStorageGameParsed.data!;
}
