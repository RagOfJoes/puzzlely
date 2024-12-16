import { useMemo } from "react";

import type { LoaderFunctionArgs, MetaFunction, TypedResponse } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunctionArgs } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

import { GameLayout, GameLayoutFooter, GameLayoutGrid, GameLayoutHeader } from "@/layouts/game";
import { hydrateGamePayload } from "@/lib/hydrate-game-payload";
import { hydratePuzzle } from "@/lib/hydrate-puzzle";
import { hydrateUser } from "@/lib/hydrate-user";
import { transformGameToPayload } from "@/lib/transform-game-to-payload";
import { API } from "@/services/api.server";
import { redirectWithInfo } from "@/services/toast.server";
import type { GamePayload } from "@/types/game-payload";
import type { Puzzle } from "@/types/puzzle";
import type { User } from "@/types/user";

type LoaderResponse = {
	game?: GamePayload;
	me?: User;
	puzzle: Puzzle;
};

export async function loader({
	params,
	request,
}: LoaderFunctionArgs): Promise<TypedResponse<LoaderResponse>> {
	const me = await API.me(request);
	// If the user hasn't completed their profile
	if (me.success && me.data.user && me.data.user.state === "PENDING" && !me.data.user.updated_at) {
		return redirectWithInfo("/profile/complete", {
			message: "Please complete your profile setup!",
		});
	}

	const puzzle = await API.puzzles.get(request, params.id ?? "");
	if (!puzzle.success) {
		// eslint-disable-next-line @typescript-eslint/no-throw-literal
		throw new Response("Failed to fetch puzzles!", { status: 404 });
	}

	if (!me.success || !me.data.user) {
		return json({
			me: undefined,
			puzzle: {
				...puzzle.data,
				groups: puzzle.data.groups.map((group) => ({
					...group,
					blocks: group.blocks.map((block) => ({
						...block,
						value: btoa(block.value),
					})),
				})),
			},
		});
	}

	const game = await API.games.get(request, puzzle.data.id);
	return json({
		game: game.success ? transformGameToPayload(game.data) : undefined,
		me: me.data.user,
		puzzle: {
			...puzzle.data,
			groups: puzzle.data.groups.map((group) => ({
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
	const needsRevalidation = ["/games/save", "/puzzles/like"].some((value) => {
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

export default function PuzzlePlay() {
	const loaderData = useLoaderData<LoaderResponse>();

	const { game, me, puzzle } = useMemo(
		() => ({
			game: loaderData.game ? hydrateGamePayload(loaderData.game) : undefined,
			me: loaderData.me ? hydrateUser(loaderData.me) : undefined,
			puzzle: hydratePuzzle(loaderData.puzzle),
		}),
		[loaderData],
	);

	return (
		<GameLayout game={game} me={me} puzzle={puzzle}>
			<GameLayoutHeader />
			<GameLayoutGrid />
			<GameLayoutFooter />
		</GameLayout>
	);
}
