import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, useEffect, useMemo } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { useFetcher } from "react-router";
import { toast as notify } from "sonner";

import { Header } from "@/components/header";
import { GameProvider, useGame } from "@/hooks/use-game";
import { useGameLocalStorage } from "@/hooks/use-game-local-storage";
import { cn } from "@/lib/cn";
import { isGamePayloadValid } from "@/lib/is-game-payload-valid";
import { pickLatestGame } from "@/lib/pick-latest-game";
import type { action } from "@/routes/games.save.$id";
import { type GamePayload } from "@/types/game-payload";
import type { Puzzle } from "@/types/puzzle";
import type { User } from "@/types/user";

export type GameLayoutProps = ComponentPropsWithoutRef<typeof Primitive.div> & {
	game?: GamePayload;
	me?: User;
	puzzle: Puzzle;
};

// TODO: Limit localStorage save functionality to the following scenarios:
// - When the user is unauthenticated
// - When the user is authenticated and is not online
//
// TODO: Sync localStorage with the server
export const GameLayout = forwardRef<ElementRef<typeof Primitive.div>, GameLayoutProps>(
	({ children, className, game, me, puzzle, ...props }, ref) => {
		const fetcher = useFetcher<typeof action>({
			key: "games.save",
		});

		const [localStorageData, setLocalStorageData] = useGameLocalStorage(me);

		const latestGame = useMemo(() => {
			const picked = pickLatestGame(game, localStorageData?.[puzzle.id]);

			if (!isGamePayloadValid(picked, puzzle)) {
				return undefined;
			}

			return picked;
		}, [game, localStorageData, puzzle]);

		const ctx = useGame({
			game: latestGame,
			puzzle,
		});
		const [state] = ctx;

		// Saves game to localStorage when the user makes an attempt
		useEffect(() => {
			if (
				localStorageData?.[puzzle.id]?.attempts.length === state.game.attempts.length ||
				puzzle.id !== state.puzzle.id ||
				state.game.attempts.length === 0
			) {
				return;
			}

			setLocalStorageData({
				...localStorageData,
				[state.puzzle.id]: state.game,
			});

			// NOTE: `setLocalStorageData` doesn't need to be a dependency since we're not using an updater function
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [localStorageData, puzzle.id, state.game, state.puzzle.id]);

		// Saves game to the API when the user makes an attempt
		useEffect(() => {
			if (
				game?.attempts.length === state.game.attempts.length ||
				!me ||
				puzzle.id !== state.puzzle.id ||
				state.game.attempts.length === 0
			) {
				return;
			}

			switch (fetcher.state) {
				case "loading":
					notify.dismiss("games.save");
					break;
				case "submitting":
					break;
				default:
					if (
						fetcher.data?.success &&
						fetcher.data.data.attempts.length === state.game.attempts.length
					) {
						return;
					}

					fetcher.submit(JSON.stringify(state.game), {
						action: `/games/save/${state.puzzle.id}`,
						encType: "application/json",
						method: "PUT",
					});

					notify.loading("Saving...", {
						id: "games.save",
					});
					break;
			}
		}, [fetcher, game?.attempts.length, me, puzzle.id, state.game, state.puzzle.id]);

		return (
			<>
				<Header me={me} />

				<main
					className={cn(
						"mx-auto h-[calc(100dvh-var(--header-height))] max-w-screen-md px-5 pb-2",

						"max-lg:min-h-[700px]",
					)}
				>
					<Primitive.div
						{...props}
						className={cn(
							"flex h-full w-full max-w-3xl flex-col gap-1",

							className,
						)}
						ref={ref}
					>
						<GameProvider value={ctx}>{children}</GameProvider>
					</Primitive.div>
				</main>
			</>
		);
	},
);
GameLayout.displayName = "GameLayout";
