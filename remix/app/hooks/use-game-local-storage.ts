import lzstring from "lz-string";
import { z } from "zod";

import { useLocalStorage } from "@/hooks/use-local-storage";
import type { GamePayload } from "@/types/game-payload";
import { GamePayloadSchema } from "@/types/game-payload";

export function useGameLocalStorage(): ReturnType<
	typeof useLocalStorage<Record<string, GamePayload>>
> {
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
				} catch {
					/* empty */
				}

				return {};
			},
			raw: false,
			serializer: (value) => lzstring.compressToUTF16(JSON.stringify(value)),
		},
	);

	return [localStorageData, setLocalStorageData, removeLocalStorageData];
}
