import { useCallback, useEffect, useState } from "react";

import lzstring from "lz-string";
import { z } from "zod";

import { createContext } from "@/lib/create-context";
import { off, on } from "@/lib/listeners";
import { omit } from "@/lib/omit";
import { GamePayloadSchema, type GamePayload } from "@/types/game-payload";

import { useGameLocalStorage } from "./use-game-local-storage";

export type UseGameLocal = [
	{
		games: Record<string, GamePayload>;
		isLoading: boolean;
	},
	{
		remove: (id: string) => void;
		save: (id: string, payload: GamePayload) => void;
	},
];

export const [GameLocalProvider, useGameLocalContext] = createContext<UseGameLocal>({
	hookName: "useGameLocalContext",
	name: "GameLocal",
	providerName: "GameLocalProvider",
});

export function useGameLocal(): UseGameLocal {
	const [local, setLocal] = useGameLocalStorage();

	const [games, setGames] = useState<UseGameLocal[0]["games"]>({});
	const [isLoading, toggleIsLoading] = useState<UseGameLocal[0]["isLoading"]>(true);

	// On mount, initialize unsaved
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		if (!local) {
			toggleIsLoading(false);
			return;
		}

		const map: Record<string, GamePayload> = {};

		const keys = Object.keys(local ?? {});
		for (let i = 0; i < keys.length; i += 1) {
			const key = keys[i];
			if (!key) {
				// eslint-disable-next-line no-continue
				continue;
			}

			const value = (local ?? {})[key];
			if (!value) {
				// eslint-disable-next-line no-continue
				continue;
			}

			const parsed = GamePayloadSchema.safeParse(value);
			if (!parsed.success) {
				// eslint-disable-next-line no-continue
				continue;
			}

			map[key] = parsed.data;
		}

		setGames(map);
		toggleIsLoading(false);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Add event listener to localStorage changes
	useEffect(() => {
		const onChange = (e: StorageEvent) => {
			try {
				const newValue = z
					.record(GamePayloadSchema)
					.parse(JSON.parse(lzstring.decompressFromUTF16(e.newValue ?? "")) ?? {});

				setGames(newValue);
				setLocal(newValue);
			} catch {
				/* empty */
			}
		};

		on(window, "storage", onChange);
		return () => {
			off(window, "storage", onChange);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const remove: UseGameLocal[1]["remove"] = useCallback(
		(id) => {
			setGames((prev) => omit(prev, [id]));
			setLocal((prev) => omit(prev ?? {}, [id]));
		},
		[setLocal],
	);

	const save: UseGameLocal[1]["save"] = useCallback(
		(id, payload) => {
			setGames((prev) => ({
				...prev,
				[id]: payload,
			}));

			setLocal((prev) => ({
				...prev,
				[id]: payload,
			}));
		},
		[setLocal],
	);

	return [
		{
			games,
			isLoading,
		},
		{
			remove,
			save,
		},
	];
}
