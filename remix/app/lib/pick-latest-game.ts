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

	return loaderGameParsed.data!.attempts.length >= localStorageGameParsed.data!.attempts.length
		? loaderGameParsed.data!
		: localStorageGameParsed.data!;
}
