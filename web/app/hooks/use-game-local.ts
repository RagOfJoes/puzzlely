import { useCallback, useEffect, useState } from "react";

import { useGameLocalStorage } from "@/hooks/use-game-local-storage";
import { createContext } from "@/lib/create-context";
import { omit } from "@/lib/omit";
import { type GamePayload } from "@/types/game-payload";

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
	const [games, setGames] = useGameLocalStorage();

	const [isLoading, toggleIsLoading] = useState<UseGameLocal[0]["isLoading"]>(true);

	// On mount, initialize unsaved
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		toggleIsLoading(false);
	}, []);

	const remove: UseGameLocal[1]["remove"] = useCallback(
		(id) => {
			setGames((prev) => ({ ...omit(prev, [id]) }));
		},
		[setGames],
	);

	const save: UseGameLocal[1]["save"] = useCallback(
		(id, payload) => {
			setGames((prev) => ({
				...prev,
				[id]: payload,
			}));
		},
		[setGames],
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
