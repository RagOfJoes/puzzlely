import { useEffect } from "react";

import type { LoaderFunctionArgs, MetaFunction, TypedResponse } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { toast as notify } from "sonner";

import { Header } from "@/components/header";
import { GameProvider, useGame } from "@/hooks/use-game";
import { cn } from "@/lib/cn";
import { hydrateGame } from "@/lib/hydrate-game";
import { hydratePuzzle } from "@/lib/hydrate-puzzle";
import { hydrateUser } from "@/lib/hydrate-user";
import type { action } from "@/routes/games.save.$id";
import { API } from "@/services/api.server";
import { redirectWithInfo } from "@/services/toast.server";
import type { Game } from "@/types/game";
import type { PageInfo } from "@/types/page-info";
import type { Puzzle } from "@/types/puzzle";
import type { User } from "@/types/user";

import { IndexFooter } from "./_index.footer";
import { IndexGrid } from "./_index.grid";
import { IndexHeader } from "./_index.header";

type LoaderResponse = {
	game?: Game;
	me?: User;
	pageInfo: PageInfo;
	puzzle: Puzzle;
};

/**
 * TODO: Save last cursor to a cookie to persist user's place
 * TODO: If not authenticated, save games to localStorage
 * TODO: Create error page
 */
export async function loader({
	request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderResponse>> {
	const [me, puzzles] = await Promise.all([API.me(request), API.puzzles.recent(request)]);
	// If the user hasn't completed their profile
	if (me.success && me.data.user && me.data.user.state === "PENDING" && !me.data.user.updated_at) {
		return redirectWithInfo("/profile/complete", {
			message: "Please complete your profile setup!",
		});
	}

	if (!puzzles.success || !puzzles.data) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response("Failed to fetch puzzles!", { status: 500 });
	}

	// TODO: Render error here
	const edge = puzzles.data.edges?.[0];
	if (!edge) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response("Failed to fetch puzzles!", { status: 500 });
	}

	if (!me.success) {
		return json({
			me: undefined,
			pageInfo: puzzles.data.page_info,
			puzzle: {
				...edge.node,
				groups: edge.node.groups.map((group) => ({
					...group,
					blocks: group.blocks.map((block) => ({
						...block,
						value: btoa(block.value),
					})),
				})),
			},
		});
	}

	const game = await API.games.get(request, { puzzleID: edge.node.id });
	return json({
		game: game.success ? game.data : undefined,
		me: me.data.user,
		pageInfo: puzzles.data.page_info,
		puzzle: {
			...edge.node,
			groups: edge.node.groups.map((group) => ({
				...group,
				blocks: group.blocks.map((block) => ({
					...block,
					value: btoa(block.value),
				})),
			})),
		},
	});
}

export const meta: MetaFunction<typeof loader> = () => [
	{
		title: "Puzzlely",
	},
];

export function shouldRevalidate({
	defaultShouldRevalidate,
	formAction,
}: ShouldRevalidateFunctionArgs) {
	// If the user likes a puzzle or updates their profile, then, there's no need to revalidate current route's loader
	const needsRevalidation = ["/puzzles/like", "/games/save"].some((value) => {
		if (!formAction) {
			return false;
		}

		return formAction.includes(value);
	});
	if (!needsRevalidation) {
		return defaultShouldRevalidate;
	}

	return false;
}

// TODO: Figure out a good way to implement local storage
export default function Index() {
	const loaderData = useLoaderData<LoaderResponse>();

	const fetcher = useFetcher<typeof action>({
		key: "games.save",
	});

	const ctx = useGame({
		game: loaderData.game ? hydrateGame(loaderData.game) : undefined,
		puzzle: hydratePuzzle(loaderData.puzzle),
	});
	const [state] = ctx;

	useEffect(() => {
		if (
			loaderData.game?.attempts.length === state.game.attempts.length ||
			!loaderData.me ||
			loaderData.puzzle.id !== state.puzzle.id ||
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

				notify.loading("Saving game...", {
					id: "games.save",
				});
				break;
		}
	}, [fetcher, loaderData.game, loaderData.me, loaderData.puzzle.id, state.game, state.puzzle.id]);

	return (
		<>
			<Header me={loaderData.me ? hydrateUser(loaderData.me) : undefined} />

			<main
				className={cn(
					"mx-auto h-[calc(100dvh-var(--header-height))] max-w-screen-md px-5 pb-2",

					"max-lg:min-h-[700px]",
				)}
			>
				<div className="flex h-full w-full max-w-3xl flex-col gap-1">
					<GameProvider value={ctx}>
						<IndexHeader />
						<IndexGrid />
						<IndexFooter />
					</GameProvider>
				</div>
			</main>
		</>
	);
}
