import lzstring from "lz-string";
import { z } from "zod";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { GamePayload } from "@/types/game-payload";
import { GamePayloadSchema } from "@/types/game-payload";
import type { User } from "@/types/user";

export function useGameLocalStorage(
	me?: User,
): ReturnType<typeof useLocalStorage<Record<string, GamePayload>>> {
	const [localStorageData, setLocalStorageData, removeLocalStorageData] = useLocalStorage<
		Record<string, GamePayload>
	>(
		me ? `games:${me.id}` : "games",
		{},
		{
			deserializer: (value) => {
				try {
					const deserialized = lzstring.decompressFromUTF16(value);
					const parsed = JSON.parse(deserialized);

					const games = z.record(GamePayloadSchema).parse(parsed);
					return games;
				} catch (e) {
					console.error("Failed to retrieve games from localStorage.", e);
				}

				return {};
			},
			raw: false,
			serializer: (value) => lzstring.compressToUTF16(JSON.stringify(value)),
		},
	);

	return [localStorageData, setLocalStorageData, removeLocalStorageData];
}
