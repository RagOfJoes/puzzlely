import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef, useEffect } from "react";

import { Primitive } from "@radix-ui/react-primitive";
import { useFetcher } from "@remix-run/react";
import { toast as notify } from "sonner";

import { Header } from "@/components/header";
import { GameProvider, useGame } from "@/hooks/use-game";
import { cn } from "@/lib/cn";
import type { action } from "@/routes/games.save.$id";
import type { GamePayload } from "@/types/game-payload";
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

		const ctx = useGame({
			game,
			puzzle,
		});
		const [state] = ctx;

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
