import lzstring from "lz-string";
import { z } from "zod";

import type { UseLocalStorage } from "@/hooks/use-local-storage";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { GamePayload } from "@/types/game-payload";
import { GamePayloadSchema } from "@/types/game-payload";

export function useGameLocalStorage(): UseLocalStorage<Record<string, GamePayload>> {
	const [localStorageData, setLocalStorageData, removeLocalStorageData] = useLocalStorage<
		Record<string, GamePayload>
	>(
		"games",
		{},
		{
			deserializer: (value) => {
				try {
					const deserialized = lzstring.decompressFromUTF16(value);
					const parsed = JSON.parse(deserialized);

					const games = z.record(GamePayloadSchema).parse(parsed);
					return games;
				} catch (e) {
					// eslint-disable-next-line no-console
					console.error("[useGameLocalStorage]: Failed to deserialize data:", e);
				}

				return {};
			},
			serializer: (value) => lzstring.compressToUTF16(JSON.stringify(value)),
		},
	);

	return [localStorageData, setLocalStorageData, removeLocalStorageData];
}
