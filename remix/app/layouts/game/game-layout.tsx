import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, useEffect } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import dayjs from "dayjs";
import { useFetcher } from "react-router";
import { toast as notify } from "sonner";

import { GameProvider, useGame } from "@/hooks/use-game";
import { useGameLocalContext } from "@/hooks/use-game-local";
import { useIsOnline } from "@/hooks/use-is-online";
import { cn } from "@/lib/cn";
import type { action } from "@/routes/games.save.$id";
import { type GamePayload } from "@/types/game-payload";
import type { Puzzle } from "@/types/puzzle";
import type { User } from "@/types/user";

export type GameLayoutProps = ComponentPropsWithoutRef<typeof Primitive.div> & {
	game?: GamePayload;
	me?: User;
	puzzle: Puzzle;
};

export const GameLayout = forwardRef<ElementRef<typeof Primitive.div>, GameLayoutProps>(
	({ children, className, game, me, puzzle, ...props }, ref) => {
		const fetcher = useFetcher<typeof action>({
			key: "games.save",
		});

		const [localState, localActions] = useGameLocalContext();
		const ctx = useGame({
			game,
			puzzle,
		});
		const [state] = ctx;

		const isOnline = useIsOnline();

		// Saves game to localStorage when the user makes an attempt
		useEffect(() => {
			// Make sure the game is for the same puzzle
			// NOTE: Was an issue with Remix and not really sure this is necessary with React-Router v7
			if (puzzle.id !== state.puzzle.id) {
				return;
			}

			// If the user is authenticated and is online, then, no need to save to localStorage
			if (me && isOnline) {
				return;
			}

			// - If the user hasn't made an attempt yet or has not made any new attempts
			// - If the user hasn't given up yet
			if (
				(state.game.attempts.length === 0 ||
					localState.games[puzzle.id]?.attempts.length === state.game.attempts.length) &&
				// NOTE: Default to undefined if `completed_at` is null to ensure dayjs works properly
				dayjs(localState.games[puzzle.id]?.completed_at ?? undefined).isSame(
					dayjs(state.game.completed_at ?? undefined),
				)
			) {
				return;
			}

			localActions.save(state.puzzle.id, state.game);

			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [puzzle.id, state.game, state.puzzle.id]);

		// Saves game to the API when the user makes an attempt
		useEffect(() => {
			// - If the user isn't authenticated or isn't online
			// - If the puzzles don't match up
			if (!me || !isOnline || puzzle.id !== state.puzzle.id) {
				return;
			}

			// If the user hasn't made an attempt yet or has not made any new attempts
			if (
				(state.game.attempts.length === 0 ||
					game?.attempts.length === state.game.attempts.length) &&
				dayjs(game?.completed_at ?? undefined).isSame(dayjs(state.game.completed_at ?? undefined))
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
						fetcher.data.data.attempts.length === state.game.attempts.length &&
						// NOTE: Default to undefined if `completed_at` is null to ensure dayjs works properly
						dayjs(fetcher.data.data.completed_at ?? undefined).isSame(
							dayjs(state.game.completed_at ?? undefined),
						)
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
		}, [
			fetcher,
			game?.attempts.length,
			game?.completed_at,
			isOnline,
			me,
			puzzle.id,
			state.game,
			state.puzzle.id,
		]);

		// Remove games from localStorage when it's been saved to the API
		useEffect(() => {
			if (!fetcher.data || !fetcher.data.success || fetcher.state !== "idle" || !me) {
				return;
			}

			localActions.remove(state.puzzle.id);
		}, [fetcher, localActions, me, state.puzzle.id]);

		return (
			<GameProvider value={ctx}>
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
						{children}
					</Primitive.div>
				</main>
			</GameProvider>
		);
	},
);
GameLayout.displayName = "GameLayout";
